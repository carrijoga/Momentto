"use client"

import { useEffect, useState } from "react"
import { subscribeUser, unsubscribeUser } from "@/app/actions"
import { useLanguage } from "@/lib/language-context"
import { sendGAEvent } from "@/lib/analytics"

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

export function PushNotificationManager() {
  const { language } = useLanguage()
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  const t = {
    activate: language === "pt" ? "Ativar notificações" : "Enable notifications",
    deactivate: language === "pt" ? "Desativar notificações" : "Disable notifications",
    notSupported:
      language === "pt"
        ? "Notificações não suportadas neste browser"
        : "Notifications not supported in this browser",
  }

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
      const result = await subscribeUser(serialized)
      if (!result.success) {
        console.error("subscribeUser failed:", result.error)
      } else {
        sendGAEvent("notification_subscribed")
      }
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
      sendGAEvent("notification_unsubscribed")
    } catch (err) {
      console.error("Failed to unsubscribe:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) return null

  return (
    <div className="flex items-center justify-center mt-4">
      <button
        onClick={subscription ? unsubscribeFromPush : subscribeToPush}
        disabled={loading}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50"
      >
        {loading
          ? "..."
          : subscription
          ? t.deactivate
          : t.activate}
      </button>
    </div>
  )
}
