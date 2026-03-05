"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { saveCountdown, unsaveCountdown } from "@/lib/countdowns"

interface SaveCountdownButtonProps {
  shareId: string
  savedId: string | null
  isSaved: boolean
  resolvedData: {
    title: string
    date: string
    category: string
    expires_at?: string | null
  }
}

export function SaveCountdownButton({
  shareId,
  savedId: initialSavedId,
  isSaved: initialIsSaved,
  resolvedData,
}: SaveCountdownButtonProps) {
  const t = useTranslations("share")
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [savedId, setSavedId] = useState<string | null>(initialSavedId)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (loading) return
    setLoading(true)
    try {
      if (isSaved && savedId) {
        await unsaveCountdown(savedId, shareId)
        setIsSaved(false)
        setSavedId(null)
      } else {
        const saved = await saveCountdown(shareId, resolvedData)
        setIsSaved(true)
        setSavedId(saved.id)
      }
    } catch (e) {
      console.error("Failed to toggle save:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition disabled:opacity-60 ${
        isSaved
          ? "bg-primary text-primary-foreground shadow-primary/30 hover:opacity-90"
          : "bg-card border border-border text-foreground hover:bg-secondary"
      }`}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {isSaved ? t("saved") : t("save")}
    </button>
  )
}
