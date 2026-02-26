"use client"

import { useEffect, useState } from "react"
import { subscribeUser, unsubscribeUser } from "@/app/actions"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serialized = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serialized)
    } catch (err) {
      console.error("Failed to subscribe:", err)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    setLoading(true)
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (err) {
      console.error("Failed to unsubscribe:", err)
    } finally {
      setLoading(false)
    }
  }

  return {
    isSupported,
    subscription,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
  }
}
