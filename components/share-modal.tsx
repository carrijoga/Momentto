"use client"

import { useState } from "react"
import QRCode from "react-qr-code"
import { Copy, Check, Share2, Loader2, X, Link } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { generateShareLink } from "@/lib/countdowns"
import type { CountdownEntry } from "@/lib/types"

interface ShareModalProps {
  entry: CountdownEntry
  onClose: () => void
  onShareGenerated: (updated: CountdownEntry) => void
}

export function ShareModal({ entry, onClose, onShareGenerated }: ShareModalProps) {
  const { language } = useLanguage()
  const [current, setCurrent] = useState<CountdownEntry>(entry)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = current.share_id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${current.share_id}`
    : null

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator

  const labels = {
    title:       language === "pt" ? "Compartilhar contagem" : "Share countdown",
    generate:    language === "pt" ? "Gerar link de compartilhamento" : "Generate share link",
    generating:  language === "pt" ? "Gerando..." : "Generating...",
    copy:        language === "pt" ? "Copiar link" : "Copy link",
    copied:      language === "pt" ? "Copiado!" : "Copied!",
    shareBtn:    language === "pt" ? "Compartilhar" : "Share",
    expiry:      language === "pt"
      ? "Link expira 5 dias após a data do evento."
      : "Link expires 5 days after the event date.",
    publicView:  language === "pt"
      ? "Quem abrir este link pode acompanhar a contagem, sem poder editar."
      : "Anyone with this link can follow the countdown, without editing.",
  }

  async function handleGenerate() {
    if (loading) return
    setLoading(true)
    try {
      const updated = await generateShareLink(current)
      setCurrent(updated)
      onShareGenerated(updated)
    } catch (e) {
      console.error("Failed to generate share link:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea")
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleNativeShare() {
    if (!shareUrl) return
    try {
      await navigator.share({
        title: current.title,
        text: language === "pt"
          ? `Acompanha comigo a contagem para: ${current.title}`
          : `Follow my countdown to: ${current.title}`,
        url: shareUrl,
      })
    } catch {
      // User cancelled or not supported — ignore
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-t-3xl border border-border bg-background p-6 shadow-xl animate-in slide-in-from-bottom-4 duration-300 sm:rounded-3xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{labels.title}</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* No share_id yet — show generate button */}
        {!current.share_id && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-center text-sm text-muted-foreground">{labels.publicView}</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {labels.generating}
                </>
              ) : (
                <>
                  <Link className="size-4" />
                  {labels.generate}
                </>
              )}
            </button>
          </div>
        )}

        {/* Has share_id — show QR + URL */}
        {current.share_id && shareUrl && (
          <div className="flex flex-col items-center gap-5">
            {/* QR Code */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <QRCode value={shareUrl} size={160} />
            </div>

            {/* URL row */}
            <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground font-mono">
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                title={labels.copy}
              >
                {copied ? (
                  <Check className="size-3.5 text-green-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex w-full gap-2">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/70"
              >
                {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                {copied ? labels.copied : labels.copy}
              </button>
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  <Share2 className="size-3.5" />
                  {labels.shareBtn}
                </button>
              )}
            </div>

            {/* Expiry note */}
            <p className="text-center text-xs text-muted-foreground/70">{labels.expiry}</p>
          </div>
        )}
      </div>
    </div>
  )
}
