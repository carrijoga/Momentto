"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { syncPendingOps, migrateLocalData } from "@/lib/sync"
import { migrateAnonymousCountdowns } from "@/app/actions"
import { sendGAEvent } from "@/lib/analytics"

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; userId: string; isAnonymous: boolean; email: string | null }
  | { status: "local" }   // offline, no session yet
  | { status: "error"; message: string }

type AuthContextType = {
  userId: string | null
  userEmail: string | null
  loading: boolean
  isLocalMode: boolean
  isAnonymous: boolean
  error: string | null
  retry: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" })
  // Captures the anonymous userId before a named sign-in completes
  const prevUserIdRef = useRef<string | null>(null)

  const init = useCallback(async () => {
    setState({ status: "loading" })
    try {
      const supabase = getSupabaseBrowserClient()

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        const user = sessionData.session.user

        // After a redirect-based login (magic link / OAuth) the page fully reloads
        // or opens in a new tab, so prevUserIdRef is lost. We persist the anonymous
        // ID in localStorage (shared across tabs) and recover it here to run migration.
        const storedAnonId = localStorage.getItem("_anon_uid")
        if (storedAnonId && !(user.is_anonymous ?? false)) {
          if (storedAnonId === user.id) {
            // Same user_id: anonymous user was promoted via updateUser/linkIdentity.
            // No data migration needed — just clean up the stored key.
            localStorage.removeItem("_anon_uid")
          } else {
            // Different user_id: user signed in as a new account (signInWithOtp /
            // signInWithOAuth without linking). Migrate their anonymous data.
            try {
              await migrateLocalData(storedAnonId, user.id)
              await migrateAnonymousCountdowns(storedAnonId, user.id)
            } catch (err) {
              console.error("Migration error (post-redirect):", err)
            }
            localStorage.removeItem("_anon_uid")
          }
        }

        prevUserIdRef.current = user.id
        setState({
          status: "authenticated",
          userId: user.id,
          isAnonymous: user.is_anonymous ?? false,
          email: user.email ?? null,
        })
        syncPendingOps(user.id).catch(console.error)
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

      const newUser = data.user
      // Persist the anonymous ID across tabs so a magic-link new tab can migrate
      localStorage.setItem("_anon_uid", newUser.id)
      prevUserIdRef.current = newUser.id
      setState({ status: "authenticated", userId: newUser.id, isAnonymous: true, email: null })
      // Drain any ops queued while offline
      syncPendingOps(newUser.id).catch(console.error)
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Sem conexão. Tente novamente.",
      })
    }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    // Clear any stale anonymous ID so it doesn't interfere after sign-out
    localStorage.removeItem("_anon_uid")
    // init() will create a fresh anonymous session
    await init()
  }, [init])

  useEffect(() => {
    init()

    const supabase = getSupabaseBrowserClient()
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          const user = session.user
          const newId = user.id
          const oldId = prevUserIdRef.current
          // Also check localStorage in case prevUserIdRef was reset (page reload / new tab)
          const storedAnonId = localStorage.getItem("_anon_uid")
          const effectiveOldId =
            oldId && oldId !== newId
              ? oldId
              : storedAnonId && storedAnonId !== newId
                ? storedAnonId
                : null

          // Anonymous → named account transition: migrate data
          if (effectiveOldId && !(user.is_anonymous ?? false)) {
            try {
              await migrateLocalData(effectiveOldId, newId)
              await migrateAnonymousCountdowns(effectiveOldId, newId)
            } catch (err) {
              console.error("Migration error:", err)
            }
            localStorage.removeItem("_anon_uid")
          }

          prevUserIdRef.current = newId
          setState({
            status: "authenticated",
            userId: newId,
            isAnonymous: user.is_anonymous ?? false,
            email: user.email ?? null,
          })
          sendGAEvent("login", { method: user.app_metadata?.provider ?? "unknown" })
          syncPendingOps(newId).catch(console.error)
        }

        if (event === "SIGNED_OUT") {
          // Will be handled by the signOut() helper calling init()
        }
      }
    )

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
      listener.subscription.unsubscribe()
      window.removeEventListener("online", handleOnline)
    }
  }, [init])

  const value: AuthContextType = {
    userId: state.status === "authenticated" ? state.userId : null,
    userEmail: state.status === "authenticated" ? state.email : null,
    loading: state.status === "loading",
    isLocalMode: state.status === "local",
    isAnonymous: state.status === "authenticated" ? state.isAnonymous : true,
    error: state.status === "error" ? state.message : null,
    retry: init,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
