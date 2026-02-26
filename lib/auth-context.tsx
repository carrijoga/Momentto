"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { syncPendingOps } from "@/lib/sync"

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; userId: string }
  | { status: "local" }   // offline, no session yet
  | { status: "error"; message: string }

type AuthContextType = {
  userId: string | null
  loading: boolean
  isLocalMode: boolean
  error: string | null
  retry: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" })

  const init = useCallback(async () => {
    setState({ status: "loading" })
    try {
      const supabase = getSupabaseBrowserClient()

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        const existingUserId = sessionData.session.user.id
        setState({ status: "authenticated", userId: existingUserId })
        syncPendingOps(existingUserId).catch(console.error)
        return
      }

      // No session — sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error || !data.user) {
        // If offline, fall back to local mode instead of blocking the app
        if (!navigator.onLine) {
          setState({ status: "local" })
          return
        }
        setState({
          status: "error",
          message: error?.message ?? "Falha ao criar sessão.",
        })
        return
      }

      const newUserId = data.user.id
      setState({ status: "authenticated", userId: newUserId })
      // Drain any ops queued while offline
      syncPendingOps(newUserId).catch(console.error)
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Sem conexão. Tente novamente.",
      })
    }
  }, [])

  useEffect(() => {
    init()

    let listener: { subscription: { unsubscribe: () => void } } | undefined

    try {
      const supabase = getSupabaseBrowserClient()
      const { data } = supabase.auth.onAuthStateChange((event: string, session: { user?: { id: string } } | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          const uid = session.user.id
          setState({ status: "authenticated", userId: uid })
          syncPendingOps(uid).catch(console.error)
        }
        if (event === "SIGNED_OUT") {
          setState({ status: "error", message: "Sessão encerrada." })
        }
      })
      listener = data
    } catch {
      // Supabase env vars not available yet — listener will be set up on retry
    }

    // When connectivity returns while in local mode, retry auth
    const handleOnline = () => {
      setState((prev) => {
        if (prev.status === "local" || prev.status === "error") {
          init()
        }
        return prev
      })
    }
    window.addEventListener("online", handleOnline)

    return () => {
      listener?.subscription.unsubscribe()
      window.removeEventListener("online", handleOnline)
    }
  }, [init])

  const value: AuthContextType = {
    userId: state.status === "authenticated" ? state.userId : null,
    loading: state.status === "loading",
    isLocalMode: state.status === "local",
    error: state.status === "error" ? state.message : null,
    retry: init,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
