"use server"

import webpush from "web-push"
import { redis } from "@/lib/redis"

const SUBSCRIPTION_KEY = "push-subscription"

function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    throw new Error(
      `Missing VAPID keys. NEXT_PUBLIC_VAPID_PUBLIC_KEY=${!!publicKey}, VAPID_PRIVATE_KEY=${!!privateKey}`
    )
  }

  webpush.setVapidDetails("mailto:mytrip@app.com", publicKey, privateKey)
}

export async function subscribeUser(sub: PushSubscription) {
  try {
    await redis.set(SUBSCRIPTION_KEY, JSON.stringify(sub))
    return { success: true }
  } catch (error) {
    console.error("subscribeUser error:", error)
    return { success: false, error: String(error) }
  }
}

export async function unsubscribeUser() {
  try {
    await redis.del(SUBSCRIPTION_KEY)
    return { success: true }
  } catch (error) {
    console.error("unsubscribeUser error:", error)
    return { success: false, error: String(error) }
  }
}

export async function sendNotification(title: string, body: string) {
  try {
    initWebPush()
  } catch (error) {
    console.error("VAPID init error:", error)
    return { success: false, error: String(error) }
  }

  let raw: string | null
  try {
    raw = await redis.get<string>(SUBSCRIPTION_KEY)
  } catch (error) {
    console.error("Redis get error:", error)
    return { success: false, error: `Redis error: ${String(error)}` }
  }

  if (!raw) {
    return { success: false, error: "No subscription found" }
  }

  const subscription = typeof raw === "string" ? JSON.parse(raw) : raw

  try {
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
