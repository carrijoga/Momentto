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
  Plane,
  Heart,
  GraduationCap,
  PartyPopper,
  Plus,
  BookmarkMinus,
  ExternalLink,
  Link2,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { AirplaneIcon } from "@/components/ui/airplane"
import { HeartIcon } from "@/components/ui/heart"
import { GraduationCapIcon } from "@/components/ui/graduation-cap"
import { PartyPopperIcon } from "@/components/ui/party-popper"
import NumberFlow from "@number-flow/react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { ShareModal } from "@/components/share-modal"
import { generateShareLink } from "@/lib/countdowns"
import type { CountdownEntry, SavedCountdownEntry } from "@/lib/types"
import { BlurText } from "@/components/ui/blur-text"
import { GradientText } from "@/components/ui/gradient-text"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { cn } from "@/lib/utils"

// ── Icon helpers ──────────────────────────────────────────────────────────────

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case "viagem":      return <Plane className={className} />
    case "casamento":   return <Heart className={className} />
    case "formatura":   return <GraduationCap className={className} />
    case "festa":       return <PartyPopper className={className} />
    case "aniversario": return <Cake className={className} />
    case "bebe":        return <Baby className={className} />
    case "show":        return <Music className={className} />
    case "conquista":   return <Trophy className={className} />
    case "evento":      return <Calendar className={className} />
    default:            return <Star className={className} />
  }
}

// ── Time helpers ──────────────────────────────────────────────────────────────

function getDaysRemaining(date: string): number {
  const target = new Date(date + "T23:59:59").getTime()
  return Math.max(0, Math.ceil((target - Date.now()) / 86400000))
}

function formatDate(date: string, locale: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(
    locale,
    { day: "2-digit", month: "short", year: "numeric" }
  )
}

function useLiveCountdown(targetDate: string, targetTime?: string | null) {
  function calc() {
    const target = new Date(targetDate + "T" + (targetTime ? targetTime + ":00" : "23:59:59"))
    const diff = Math.max(0, target.getTime() - Date.now())
    const s = Math.floor(diff / 1000)
    return {
      days:    Math.floor(s / 86400),
      hours:   Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    }
  }
  const [live, setLive] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setLive(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate, targetTime])
  return live
}

// ── Hero Card ─────────────────────────────────────────────────────────────────

function HeroCard({
  entry,
  mounted,
  onOpen,
  onShare,
  onDelete,
}: {
  entry: CountdownEntry
  mounted: boolean
  onOpen: (e: CountdownEntry) => void
  onShare: (e: CountdownEntry) => void
  onDelete: (id: string) => void
}) {
  const t = useTranslations("list")
  const tCountdown = useTranslations("countdown")
  const tCat = useTranslations("categories")
  const locale = useLocale()
  const live = useLiveCountdown(entry.date, entry.time)

  const isFinished = mounted && live.days === 0 && live.hours === 0 && live.minutes === 0 && live.seconds === 0

  const progressPercent = (() => {
    const created = new Date(entry.created_at).getTime()
    const target = new Date(entry.date + "T" + (entry.time ? entry.time + ":00" : "23:59:59")).getTime()
    const now = Date.now()
    const total = target - created
    if (total <= 0) return 100
    return Math.min(100, Math.max(0, ((now - created) / total) * 100))
  })()

  const catLabel = tCat(entry.category as Parameters<typeof tCat>[0]) ?? tCat("outro")

  const formattedDate = new Date(entry.date + "T00:00:00").toLocaleDateString(
    locale,
    { day: "2-digit", month: "long", year: "numeric" }
  )

  const units = [
    { val: live.days,    label: tCountdown("days") },
    { val: live.hours,   label: tCountdown("hours") },
    { val: live.minutes, label: tCountdown("minutes") },
    { val: live.seconds, label: tCountdown("seconds") },
  ]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <SpotlightCard
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-5 shadow-xl shadow-primary/8 cursor-pointer sm:p-6"
        onClick={() => onOpen(entry)}
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/8 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-primary/5 blur-2xl" />

        {/* Top row */}
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {t("nextUp")}
          </span>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <CategoryIcon id={entry.category} className="size-3 shrink-0" />
            {catLabel}
          </div>
        </div>

        {/* Title + date */}
        <h2 className="mb-0.5 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          {entry.title}
        </h2>
        <p className="mb-5 text-xs text-muted-foreground">{formattedDate}</p>

        {/* Live countdown */}
        {isFinished ? (
          <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl bg-primary/10 py-5">
            <span className="text-xl font-bold text-primary">{tCountdown("bigDay")}</span>
          </div>
        ) : (
          <div className="mb-5 grid grid-cols-4 gap-2">
            {units.map(({ val, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/60 px-1 py-3"
              >
                {mounted ? (
                  <NumberFlow
                    value={val}
                    className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl"
                    format={{ minimumIntegerDigits: 2 }}
                  />
                ) : (
                  <span className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                    --
                  </span>
                )}
                <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {!isFinished && (
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{Math.round(progressPercent)}% {tCountdown("elapsed")}</span>
              {entry.share_id && (
                <span className="flex items-center gap-1 text-primary/60">
                  <Link2 className="size-3" />
                  Link
                </span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-1 items-center gap-1 text-xs font-medium text-muted-foreground">
            <ChevronRight className="size-3.5 text-primary/60" />
            <span className="text-primary/70">{t("viewDetails")}</span>
          </div>
          <button
            onClick={() => onShare(entry)}
            className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-secondary/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            aria-label="Compartilhar"
          >
            <Share2 className="size-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex size-10 items-center justify-center rounded-xl border border-border/80 bg-secondary/50 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            aria-label="Excluir"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </SpotlightCard>
    </motion.div>
  )
}

// ── Compact Card ──────────────────────────────────────────────────────────────

function CompactCard({
  entry,
  mounted,
  locale,
  onOpen,
  onShare,
  onDelete,
  isLast,
}: {
  entry: CountdownEntry
  mounted: boolean
  locale: string
  onOpen: (e: CountdownEntry) => void
  onShare: (e: CountdownEntry) => void
  onDelete: (id: string) => void
  isLast: boolean
}) {
  const t = useTranslations("list")
  const tCat = useTranslations("categories")
  const days = mounted ? getDaysRemaining(entry.date) : 999
  const isFinished = mounted && days === 0
  const isUrgent = mounted && !isFinished && days <= 7
  const catLabel = tCat(entry.category as Parameters<typeof tCat>[0]) ?? tCat("outro")

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-secondary/40",
        !isLast && "border-b border-border/50"
      )}
      onClick={() => onOpen(entry)}
    >
      {/* Urgency accent */}
      <div
        className={cn(
          "absolute left-0 top-1/4 h-1/2 w-0.5 rounded-r-full",
          isFinished ? "bg-primary" : isUrgent ? "bg-amber-500" : "bg-primary/20"
        )}
      />

      {/* Category icon */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
        <CategoryIcon id={entry.category} className="size-4" />
      </div>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground leading-snug">
          {entry.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
            {formatDate(entry.date, locale)}
          </span>
          {entry.share_id && (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary/60">
              <Link2 className="size-2.5" />
              Link
            </span>
          )}
        </div>
      </div>

      {/* Days badge */}
      <div className="flex flex-col items-end shrink-0">
        <span
          className={cn(
            "text-xl font-bold tabular-nums leading-none",
            isFinished ? "text-primary" : isUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground"
          )}
        >
          {isFinished ? "!" : days}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {isFinished ? t("arrived") : t("days")}
        </span>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onShare(entry) }}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
          aria-label={t("share")}
        >
          <Share2 className="size-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
          aria-label={t("delete")}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <ChevronRight className="size-4 shrink-0 text-border/80 group-hover:text-muted-foreground transition-colors" />
    </motion.div>
  )
}

// ── Saved Card ────────────────────────────────────────────────────────────────

function SavedCard({
  entry,
  mounted,
  locale,
  onNavigate,
  onUnsave,
  isLast,
}: {
  entry: SavedCountdownEntry
  mounted: boolean
  locale: string
  onNavigate: () => void
  onUnsave: () => void
  isLast: boolean
}) {
  const t = useTranslations("list")
  const tCat = useTranslations("categories")
  const days = mounted ? getDaysRemaining(entry.date) : 999
  const isFinished = mounted && days === 0
  const isUrgent = mounted && !isFinished && days <= 7
  const catLabel = tCat(entry.category as Parameters<typeof tCat>[0]) ?? tCat("outro")

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-secondary/40",
        !isLast && "border-b border-border/50"
      )}
      onClick={onNavigate}
    >
      {/* Urgency accent */}
      <div
        className={cn(
          "absolute left-0 top-1/4 h-1/2 w-0.5 rounded-r-full",
          isFinished ? "bg-primary" : isUrgent ? "bg-amber-500" : "bg-primary/20"
        )}
      />

      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <ExternalLink className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground leading-snug">{entry.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-medium text-primary/60 uppercase tracking-wide">{catLabel}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
            {formatDate(entry.date, locale)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span
          className={cn(
            "text-xl font-bold tabular-nums leading-none",
            isFinished ? "text-primary" : isUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground"
          )}
        >
          {isFinished ? "!" : days}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {isFinished ? t("arrived") : t("days")}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onUnsave() }}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
          aria-label={t("unsave")}
        >
          <BookmarkMinus className="size-3.5" />
        </button>
      </div>

      <ChevronRight className="size-4 shrink-0 text-border/80 group-hover:text-muted-foreground transition-colors" />
    </motion.div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  const t = useTranslations("list")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20 shadow-xl shadow-primary/10"
      >
        <Sparkles className="size-9 text-primary" />
      </motion.div>

      <h2 className="mb-2 text-xl font-bold">
        <GradientText>{t("myCountdowns")}</GradientText>
      </h2>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {t("savedEmptyDescription")}
      </p>

      <motion.button
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNew}
        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" />
        {t("new")}
      </motion.button>
    </motion.div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border/50" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface CountdownListProps {
  countdowns: CountdownEntry[]
  savedCountdowns: SavedCountdownEntry[]
  onOpen: (entry: CountdownEntry) => void
  onNew: () => void
  onDelete: (id: string) => void
  onUnsave: (id: string, shareId: string) => void
}

export function CountdownList({
  countdowns,
  savedCountdowns,
  onOpen,
  onNew,
  onDelete,
  onUnsave,
}: CountdownListProps) {
  const t = useTranslations("list")
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

  // Sort by soonest date first
  const sorted = [...local].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const [heroEntry, ...restEntries] = sorted

  return (
    <div className="min-h-dvh pb-28">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-4 pt-8 pb-6 sm:px-6">
        {/* Header glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />

        <div className="relative">
          {mounted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50"
            >
              {new Date().toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
            </motion.p>
          )}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              <BlurText text={t("myCountdowns")} duration={0.4} delay={0.05} />
            </h1>
            {local.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
                className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              >
                {local.length}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="space-y-5 px-4 sm:px-6">

        {local.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <>
            {/* Hero: next upcoming countdown */}
            <AnimatePresence mode="popLayout">
              {heroEntry && (
                <HeroCard
                  key={heroEntry.id}
                  entry={heroEntry}
                  mounted={mounted}
                  onOpen={onOpen}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              )}
            </AnimatePresence>

            {/* Rest: compact stacked list */}
            {restEntries.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.15 }}
              >
                <SectionLabel>{t("otherMoments")}</SectionLabel>

                <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <AnimatePresence mode="popLayout">
                    {restEntries.map((entry, i) => (
                      <CompactCard
                        key={entry.id}
                        entry={entry}
                        mounted={mounted}
                        locale={locale}
                        onOpen={onOpen}
                        onShare={handleShare}
                        onDelete={handleDelete}
                        isLast={i === restEntries.length - 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}
          </>
        )}

        {/* Saved countdowns */}
        {localSaved.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.25 }}
          >
            <SectionLabel>{t("savedCountdowns")}</SectionLabel>

            <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card">
              <AnimatePresence mode="popLayout">
                {localSaved.map((entry, i) => (
                  <SavedCard
                    key={entry.id}
                    entry={entry}
                    mounted={mounted}
                    locale={locale}
                    onNavigate={() => router.push(`/${locale}/c/${entry.share_id}`)}
                    onUnsave={() => handleUnsave(entry.id, entry.share_id)}
                    isLast={i === localSaved.length - 1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* Saved empty state — only show when user has own countdowns but no saved */}
        {local.length > 0 && localSaved.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-secondary/10 px-6 py-8 text-center"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <ExternalLink className="size-4" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("savedEmpty")}</p>
            <p className="max-w-xs text-xs text-muted-foreground">{t("savedEmptyDescription")}</p>
          </motion.div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
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
