"use server"

import webpush from "web-push"
import { redis } from "@/lib/redis"

const SUBSCRIPTION_KEY = "push-subscription"

function initWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    console.warn(
      `Missing VAPID keys. NEXT_PUBLIC_VAPID_PUBLIC_KEY=${!!publicKey}, VAPID_PRIVATE_KEY=${!!privateKey}`
    )
    return false
  }

  webpush.setVapidDetails("mailto:mytrip@app.com", publicKey, privateKey)
  return true
}

export async function subscribeUser(sub: PushSubscription) {
  try {
    if (!redis) {
      return { success: false, error: "Redis not configured" }
    }
    await redis.set(SUBSCRIPTION_KEY, JSON.stringify(sub))
    return { success: true }
  } catch (error) {
    console.error("subscribeUser error:", error)
    return { success: false, error: String(error) }
  }
}

export async function unsubscribeUser() {
  try {
    if (!redis) {
      return { success: false, error: "Redis not configured" }
    }
    await redis.del(SUBSCRIPTION_KEY)
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

  let raw: string | null
  try {
    if (!redis) {
      return { success: false, error: "Redis not configured" }
    }
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
