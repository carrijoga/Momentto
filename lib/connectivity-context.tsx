"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { syncPendingOps } from "@/lib/sync"
import { getPendingCount } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"

type ConnectivityState = {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  refreshPendingCount: () => Promise<void>
}

const ConnectivityContext = createContext<ConnectivityState | undefined>(undefined)

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  const [isOnline, setIsOnline] = useState(true) // will be set correctly on mount
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount()
    setPendingCount(count)
  }, [])

  const runSync = useCallback(async () => {
    if (!userId || !navigator.onLine) return
    setIsSyncing(true)
    try {
      await syncPendingOps(userId)
    } finally {
      setIsSyncing(false)
      await refreshPendingCount()
    }
  }, [userId, refreshPendingCount])

  // Set real online status on mount (SSR-safe)
  useEffect(() => {
    setIsOnline(navigator.onLine)
    refreshPendingCount()
  }, [refreshPendingCount])

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      runSync()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [runSync])

  // Refresh pending count whenever sync completes
  useEffect(() => {
    const handleSynced = () => refreshPendingCount()
    window.addEventListener("countdowns-synced", handleSynced)
    return () => window.removeEventListener("countdowns-synced", handleSynced)
  }, [refreshPendingCount])

  return (
    <ConnectivityContext.Provider
      value={{ isOnline, isSyncing, pendingCount, refreshPendingCount }}
    >
      {children}
    </ConnectivityContext.Provider>
  )
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext)
  if (!ctx) throw new Error("useConnectivity must be used within ConnectivityProvider")
  return ctx
}
