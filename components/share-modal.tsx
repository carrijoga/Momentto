"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import QRCode from "react-qr-code"
import { Copy, Check, Share2, Loader2, X, Link, Trash2, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { generateShareLink, revokeShareLink } from "@/lib/countdowns"
import { getSaveCount } from "@/app/actions"
import type { CountdownEntry, ShareExpiresMode } from "@/lib/types"
import { sendGAEvent } from "@/lib/analytics"

interface ShareModalProps {
  entry: CountdownEntry
  onClose: () => void
  onShareGenerated: (updated: CountdownEntry) => void
}

const EXPIRES_OPTIONS: { value: ShareExpiresMode; labelKey: string }[] = [
  { value: "5d", labelKey: "expiry5d" },
  { value: "30d", labelKey: "expiry30d" },
  { value: "never", labelKey: "expiryNever" },
]

export function ShareModal({ entry, onClose, onShareGenerated }: ShareModalProps) {
  const t = useTranslations("share")
  const [current, setCurrent] = useState<CountdownEntry>(entry)
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresMode, setExpiresMode] = useState<ShareExpiresMode>(
    (entry.share_expires_mode as ShareExpiresMode) ?? "5d"
  )
  const [saveCount, setSaveCount] = useState<number | null>(null)

  const shareUrl = current.share_id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${current.share_id}`
    : null

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator

  // Load save count when we have a share link
  useEffect(() => {
    if (!current.share_id) return
    getSaveCount(current.share_id).then((result) => {
      if ("count" in result) setSaveCount(result.count)
    })
  }, [current.share_id])

  async function handleGenerate() {
    if (loading) return
    setLoading(true)
    try {
      const updated = await generateShareLink(current, expiresMode)
      setCurrent(updated)
      onShareGenerated(updated)
      sendGAEvent("countdown_shared", { method: "generate_link" })
    } catch (e) {
      console.error("Failed to generate share link:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke() {
    if (revoking) return
    setRevoking(true)
    setConfirmRevoke(false)
    try {
      const updated = await revokeShareLink(current)
      setCurrent(updated)
      onShareGenerated(updated)
      setSaveCount(null)
    } catch (e) {
      console.error("Failed to revoke share link:", e)
    } finally {
      setRevoking(false)
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

  async function handleDownloadQR() {
    if (!shareUrl) return
    const container = document.getElementById("share-qr-code")
    const svg = container?.querySelector("svg") as SVGSVGElement | null
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300)
      const a = document.createElement("a")
      a.download = `momentto-${current.title}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
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
          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-center text-sm text-muted-foreground">{t("publicView")}</p>

            {/* Expiry mode selector */}
            <div className="flex w-full gap-1.5 rounded-xl border border-border bg-secondary/40 p-1">
              {EXPIRES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExpiresMode(opt.value)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    expiresMode === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>

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
            className="flex flex-col items-center gap-4"
          >
            {/* QR Code */}
            <div
              id="share-qr-code"
              className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
              onClick={handleDownloadQR}
              title={t("qrDownloadHint")}
            >
              <QRCode value={shareUrl} size={160} />
            </div>
            <p className="text-center text-[11px] text-muted-foreground/60">
              {t("qrDownloadHint")}
            </p>

            {/* Save count */}
            {saveCount !== null && saveCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                {t("saveCount", { count: saveCount })}
              </div>
            )}

            {/* Link row */}
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

            {/* Action buttons */}
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
                  <Share2 className="size-3.5" />
                  {t("shareBtn")}
                </button>
              )}
            </div>

            {/* Expiry note */}
            <p className="text-center text-xs text-muted-foreground/70">{t("expiry")}</p>

            {/* Revoke */}
            {!confirmRevoke ? (
              <button
                onClick={() => setConfirmRevoke(true)}
                className="flex items-center gap-1.5 text-xs text-destructive/70 transition hover:text-destructive"
              >
                <Trash2 className="size-3" />
                {t("revoke")}
              </button>
            ) : (
              <div className="flex w-full flex-col gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-center text-xs font-medium text-foreground">{t("revokeConfirm")}</p>
                <p className="text-center text-[11px] text-muted-foreground">{t("revokeDescription")}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmRevoke(false)}
                    className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground transition hover:bg-secondary"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={revoking}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {revoking && <Loader2 className="size-3 animate-spin" />}
                    {t("revoke")}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
