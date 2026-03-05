"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { sendGAEvent } from "@/lib/analytics"
import {
  Cake,
  Baby,
  Music,
  Trophy,
  Calendar,
  Star,
  Trash2,
  Share2,
  Plus,
  BookmarkMinus,
  ExternalLink,
  Link2,
} from "lucide-react"
import { AirplaneIcon } from "@/components/ui/airplane"
import { HeartIcon } from "@/components/ui/heart"
import { GraduationCapIcon } from "@/components/ui/graduation-cap"
import { PartyPopperIcon } from "@/components/ui/party-popper"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { ShareModal } from "@/components/share-modal"
import { generateShareLink } from "@/lib/countdowns"
import type { CountdownEntry, SavedCountdownEntry } from "@/lib/types"

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const props = { size: 16, className }
  switch (id) {
    case "viagem":      return <AirplaneIcon {...props} />
    case "casamento":   return <HeartIcon {...props} />
    case "formatura":   return <GraduationCapIcon {...props} />
    case "festa":       return <PartyPopperIcon {...props} />
    case "aniversario": return <Cake className={className} />
    case "bebe":        return <Baby className={className} />
    case "show":        return <Music className={className} />
    case "conquista":   return <Trophy className={className} />
    case "evento":      return <Calendar className={className} />
    default:            return <Star className={className} />
  }
}

function getDaysRemaining(date: string): number {
  const target = new Date(date + "T23:59:59").getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((target - now) / 86400000))
}

function formatDate(date: string, locale: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(
    locale,
    { day: "2-digit", month: "short", year: "numeric" }
  )
}

interface CountdownListProps {
  countdowns: CountdownEntry[]
  savedCountdowns: SavedCountdownEntry[]
  onOpen: (entry: CountdownEntry) => void
  onNew: () => void
  onDelete: (id: string) => void
  onUnsave: (id: string, shareId: string) => void
}

export function CountdownList({ countdowns, savedCountdowns, onOpen, onNew, onDelete, onUnsave }: CountdownListProps) {
  const t = useTranslations("list")
  const tCat = useTranslations("categories")
  const locale = useLocale()
  const router = useRouter()
  const [shareTarget, setShareTarget] = useState<CountdownEntry | null>(null)
  const [local, setLocal] = useState<CountdownEntry[]>(countdowns)
  const [localSaved, setLocalSaved] = useState<SavedCountdownEntry[]>(savedCountdowns)
  const [mounted, setMounted] = useState(false)
  const removedRef = useRef<Set<string>>(new Set())
  const removedSavedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setLocal(countdowns.filter((c) => !removedRef.current.has(c.id)))
  }, [countdowns])

  useEffect(() => {
    setLocalSaved(savedCountdowns.filter((c) => !removedSavedRef.current.has(c.id)))
  }, [savedCountdowns])

  useEffect(() => { setMounted(true) }, [])

  function handleDelete(id: string) {
    removedRef.current.add(id)
    setLocal((prev) => prev.filter((c) => c.id !== id))
    sendGAEvent("countdown_deleted")
    onDelete(id)
  }

  function handleUnsave(id: string, shareId: string) {
    removedSavedRef.current.add(id)
    setLocalSaved((prev) => prev.filter((c) => c.id !== id))
    onUnsave(id, shareId)
  }

  async function handleShare(entry: CountdownEntry) {
    if (!entry.share_id) {
      try {
        const updated = await generateShareLink(entry)
        setLocal((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        setShareTarget(updated)
      } catch {
        setShareTarget(entry)
      }
    } else {
      setShareTarget(entry)
    }
  }

  const daysLabel = (n: number) => n === 1 ? t("day") : t("days")

  return (
    <div className="min-h-dvh px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* ── My Countdowns ────────────────────────────────────── */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mb-6 text-2xl font-bold tracking-tight text-foreground"
          >
            {t("myCountdowns")}
          </motion.h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {(local.length > 0 ? local : countdowns).map((entry, i) => {
                const days = mounted ? getDaysRemaining(entry.date) : 999
                const catLabel = tCat(entry.category as any) ?? tCat("outro")
                const isFinished = mounted && days === 0
                const isUrgent = mounted && !isFinished && days <= 7

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                    transition={{
                      layout: { type: "spring", stiffness: 350, damping: 30 },
                      opacity: { duration: 0.25 },
                      scale: { type: "spring", stiffness: 400, damping: 30 },
                      y: { type: "spring", stiffness: 400, damping: 30, delay: i * 0.04 },
                    }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md cursor-pointer"
                    onClick={() => onOpen(entry)}
                  >
                    {/* Top accent bar */}
                    <div
                      className={`h-1 w-full ${
                        isFinished
                          ? "bg-primary"
                          : isUrgent
                          ? "bg-amber-500"
                          : "bg-primary/20"
                      }`}
                    />

                    {/* Card body */}
                    <div className="flex flex-1 flex-col p-3 sm:p-4">

                      {/* Category badge row */}
                      <div className="mb-3 flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                          <CategoryIcon id={entry.category} className="size-3 shrink-0" />
                          <span className="text-[10px] font-medium uppercase tracking-wider leading-none truncate max-w-[70px]">
                            {catLabel}
                          </span>
                        </div>

                        {/* Shared badge — replaces the green icon */}
                        {entry.share_id && (
                          <span className="flex items-center gap-1 rounded-full border border-border/80 bg-secondary/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <Link2 className="size-2.5 shrink-0" />
                            Link
                          </span>
                        )}
                      </div>

                      {/* Days counter */}
                      <div className="mb-2.5 flex flex-col items-center py-1.5">
                        <span
                          className={`text-4xl font-bold tabular-nums tracking-tight leading-none sm:text-5xl ${
                            isFinished
                              ? "text-primary"
                              : isUrgent
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {isFinished ? "!" : days}
                        </span>
                        <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                          {isFinished ? t("arrived") : daysLabel(days)}
                        </span>
                      </div>

                      {/* Title + date */}
                      <div className="mt-auto text-center">
                        <p className="truncate text-sm font-semibold text-foreground leading-snug">
                          {entry.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground" suppressHydrationWarning>
                          {formatDate(entry.date, locale)}
                        </p>
                      </div>
                    </div>

                    {/* Action row — always visible, clear separation */}
                    <div className="flex items-center border-t border-border/60">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(entry) }}
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                        aria-label={t("share")}
                      >
                        <Share2 className="size-3.5" />
                        <span className="hidden sm:inline">{t("share")}</span>
                      </button>
                      <div className="h-4 w-px bg-border/60" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={t("delete")}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline">{t("delete")}</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Saved Countdowns ─────────────────────────────────── */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="mb-6 text-lg font-semibold tracking-tight text-foreground"
          >
            {t("savedCountdowns")}
          </motion.h2>

          {localSaved.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ExternalLink className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("savedEmpty")}</p>
              <p className="max-w-xs text-xs text-muted-foreground">{t("savedEmptyDescription")}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {localSaved.map((entry, i) => {
                  const days = mounted ? getDaysRemaining(entry.date) : 999
                  const catLabel = tCat(entry.category as any) ?? tCat("outro")
                  const isFinished = mounted && days === 0
                  const isUrgent = mounted && !isFinished && days <= 7

                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.92, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                      transition={{
                        layout: { type: "spring", stiffness: 350, damping: 30 },
                        opacity: { duration: 0.25 },
                        scale: { type: "spring", stiffness: 400, damping: 30 },
                        y: { type: "spring", stiffness: 400, damping: 30, delay: i * 0.04 },
                      }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md cursor-pointer"
                      onClick={() => router.push(`/${locale}/c/${entry.share_id}`)}
                    >
                      {/* Top accent bar */}
                      <div
                        className={`h-1 w-full ${
                          isFinished
                            ? "bg-primary"
                            : isUrgent
                            ? "bg-amber-500"
                            : "bg-primary/20"
                        }`}
                      />

                      {/* Card body */}
                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        {/* Category badge row */}
                        <div className="mb-3 flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                            <CategoryIcon id={entry.category} className="size-3 shrink-0" />
                            <span className="text-[10px] font-medium uppercase tracking-wider leading-none truncate max-w-[70px]">
                              {catLabel}
                            </span>
                          </div>
                          {/* Saved badge */}
                          <span className="flex items-center gap-1 rounded-full border border-border/80 bg-secondary/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <ExternalLink className="size-2.5 shrink-0" />
                            Salvo
                          </span>
                        </div>

                        {/* Days counter */}
                        <div className="mb-2.5 flex flex-col items-center py-1.5">
                          <span
                            className={`text-4xl font-bold tabular-nums tracking-tight leading-none sm:text-5xl ${
                              isFinished
                                ? "text-primary"
                                : isUrgent
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-foreground"
                            }`}
                          >
                            {isFinished ? "!" : days}
                          </span>
                          <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                            {isFinished ? t("arrived") : daysLabel(days)}
                          </span>
                        </div>

                        {/* Title + date */}
                        <div className="mt-auto text-center">
                          <p className="truncate text-sm font-semibold text-foreground leading-snug">
                            {entry.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground" suppressHydrationWarning>
                            {formatDate(entry.date, locale)}
                          </p>
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="flex items-center border-t border-border/60">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnsave(entry.id, entry.share_id) }}
                          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={t("unsave")}
                        >
                          <BookmarkMinus className="size-3.5" />
                          <span className="hidden sm:inline">{t("unsave")}</span>
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* New countdown FAB */}
      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNew}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
      >
        <Plus className="size-4" />
        {t("new")}
      </motion.button>

      {/* Share modal */}
      <AnimatePresence>
        {shareTarget && (
          <ShareModal
            entry={shareTarget}
            onClose={() => setShareTarget(null)}
            onShareGenerated={(updated: CountdownEntry) => {
              setLocal((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
              setShareTarget(updated)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
