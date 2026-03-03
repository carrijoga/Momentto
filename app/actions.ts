"use server"

import webpush from "web-push"
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server"

function initWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    console.warn(
      `Missing VAPID keys. NEXT_PUBLIC_VAPID_PUBLIC_KEY=${!!publicKey}, VAPID_PRIVATE_KEY=${!!privateKey}`
    )
    return false
  }

  webpush.setVapidDetails("mailto:momentto@app.com", publicKey, privateKey)
  return true
}

export async function migrateAnonymousCountdowns(
  oldUserId: string,
  newUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServiceClient()

    const { error: countdownsError } = await supabase
      .from("countdowns")
      .update({ user_id: newUserId })
      .eq("user_id", oldUserId)

    if (countdownsError) return { success: false, error: countdownsError.message }

    const { error: pushError } = await supabase
      .from("push_subscriptions")
      .update({ user_id: newUserId })
      .eq("user_id", oldUserId)

    // push_subscriptions has a UNIQUE on user_id — if new user already has one, ignore conflict
    if (pushError && pushError.code !== "23505") {
      return { success: false, error: pushError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("migrateAnonymousCountdowns error:", error)
    return { success: false, error: String(error) }
  }
}

export async function subscribeUser(sub: PushSubscription) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { user_id: user.id, subscription: sub, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    console.error("subscribeUser error:", error)
    return { success: false, error: String(error) }
  }
}

export async function unsubscribeUser() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    console.error("unsubscribeUser error:", error)
    return { success: false, error: String(error) }
  }
}

export async function sendNotification(title: string, body: string) {
  const vapidReady = initWebPush()
  if (!vapidReady) {
    return { success: false, error: "VAPID keys not configured" }
  }

  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", user.id)
      .single()

    if (error || !data) {
      return { success: false, error: "No subscription found" }
    }

    const subscription = data.subscription

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body,
        icon: "/icon-192x192.png",
        url: "/",
      })
    )
    return { success: true }
  } catch (error) {
    console.error("Error sending push notification:", error)
    return { success: false, error: "Failed to send notification" }
  }
}
