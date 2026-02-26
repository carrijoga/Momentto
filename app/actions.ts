"use server"

import webpush from "web-push"
import { redis } from "@/lib/redis"

const SUBSCRIPTION_KEY = "push-subscription"

webpush.setVapidDetails(
  "mailto:mytrip@app.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: PushSubscription) {
  await redis.set(SUBSCRIPTION_KEY, JSON.stringify(sub))
  return { success: true }
}

export async function unsubscribeUser() {
  await redis.del(SUBSCRIPTION_KEY)
  return { success: true }
}

export async function sendNotification(title: string, body: string) {
  const raw = await redis.get<string>(SUBSCRIPTION_KEY)
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
