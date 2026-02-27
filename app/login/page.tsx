"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { AirplaneIcon } from "@/components/ui/airplane"

const t = {
  pt: {
    headline: "Sincronize seus countdowns",
    sub: "Faça login para acessar seus eventos em qualquer dispositivo.",
    google: "Continuar com Google",
    emailLabel: "Seu email",
    emailPlaceholder: "voce@email.com",
    emailButton: "Enviar link de acesso",
    sending: "Enviando…",
    checkInbox: "Verifique seu email",
    checkInboxSub: (email: string) =>
      `Enviamos um link de acesso para ${email}. Clique nele para entrar.`,
    backToLogin: "Usar outro email",
    skip: "Continuar sem conta",
    errorPrefix: "Erro: ",
    orDivider: "ou",
  },
  en: {
    headline: "Sync your countdowns",
    sub: "Sign in to access your events from any device.",
    google: "Continue with Google",
    emailLabel: "Your email",
    emailPlaceholder: "you@email.com",
    emailButton: "Send magic link",
    sending: "Sending…",
    checkInbox: "Check your inbox",
    checkInboxSub: (email: string) =>
      `We sent a sign-in link to ${email}. Click it to sign in.`,
    backToLogin: "Use a different email",
    skip: "Continue without account",
    errorPrefix: "Error: ",
    orDivider: "or",
  },
}

export default function LoginPage() {
  const router = useRouter()
  const { isAnonymous, loading } = useAuth()
  const { language } = useLanguage()
  const tx = t[language as "pt" | "en"] ?? t.pt

  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already signed in with a named account
  useEffect(() => {
    if (!loading && !isAnonymous) {
      router.replace("/")
    }
  }, [isAnonymous, loading, router])

  async function handleGoogleSignIn() {
    setError(null)
    const supabase = getSupabaseBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
    if (error) setError(error.message)
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setSubmitting(true)

    const supabase = getSupabaseBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setSentTo(email.trim())
    setEmailSent(true)
  }

  // Get error from URL (redirected from callback on failure)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlError = params.get("error")
    if (urlError) setError(decodeURIComponent(urlError))
  }, [])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <AirplaneIcon size={28} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {tx.headline}
            </h1>
            <p className="text-sm text-muted-foreground">{tx.sub}</p>
          </div>
        </div>

        {emailSent ? (
          /* ── Confirmation state ── */
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-foreground">{tx.checkInbox}</p>
              <p className="text-xs text-muted-foreground">{tx.checkInboxSub(sentTo)}</p>
            </div>
            <button
              onClick={() => { setEmailSent(false); setEmail("") }}
              className="w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {tx.backToLogin}
            </button>
          </div>
        ) : (
          /* ── Sign-in form ── */
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              {tx.google}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{tx.orDivider}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Email magic link */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  {tx.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tx.emailPlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {submitting ? tx.sending : tx.emailButton}
              </button>
            </form>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {tx.errorPrefix}{error}
              </p>
            )}
          </div>
        )}

        {/* Skip */}
        <button
          onClick={() => router.push("/")}
          className="block w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {tx.skip}
        </button>
      </div>
    </main>
  )
}
