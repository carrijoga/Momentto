"use client"

import { useState } from "react"
import { motion } from "motion/react"
import QRCode from "react-qr-code"
import { Copy, Check, Share2, Loader2, X, Link } from "lucide-react"
import { useTranslations } from "next-intl"
import { generateShareLink } from "@/lib/countdowns"
import type { CountdownEntry } from "@/lib/types"
import { sendGAEvent } from "@/lib/analytics"

interface ShareModalProps {
  entry: CountdownEntry
  onClose: () => void
  onShareGenerated: (updated: CountdownEntry) => void
}

export function ShareModal({ entry, onClose, onShareGenerated }: ShareModalProps) {
  const t = useTranslations("share")
  const [current, setCurrent] = useState<CountdownEntry>(entry)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = current.share_id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${current.share_id}`
    : null

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator



  async function handleGenerate() {
    if (loading) return
    setLoading(true)
    try {
      const updated = await generateShareLink(current)
      setCurrent(updated)
      onShareGenerated(updated)
      sendGAEvent("countdown_shared", { method: "generate_link" })
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
      sendGAEvent("countdown_shared", { method: "copy_link" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
        text: t("nativeShareText", { title: current.title }),
        url: shareUrl,
      })
      sendGAEvent("countdown_shared", { method: "native_share" })
    } catch {
      // User cancelled or not supported
    }
  }

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-sm rounded-t-3xl border border-border bg-background p-6 shadow-xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* No share_id yet */}
        {!current.share_id && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-center text-sm text-muted-foreground">{t("publicView")}</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Link className="size-4" />
                  {t("generate")}
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Has share_id */}
        {current.share_id && shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <QRCode value={shareUrl} size={160} />
            </div>

            <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground font-mono">
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                title={t("copy")}
              >
                {copied ? (
                  <Check className="size-3.5 text-green-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>

            <div className="flex w-full gap-2">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary/70"
              >
                {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                {copied ? t("copied") : t("copy")}
              </button>
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  {t("shareBtn")}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground/70">{t("expiry")}</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
