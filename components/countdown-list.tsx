"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
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
} from "lucide-react"
import { AirplaneIcon } from "@/components/ui/airplane"
import { HeartIcon } from "@/components/ui/heart"
import { GraduationCapIcon } from "@/components/ui/graduation-cap"
import { PartyPopperIcon } from "@/components/ui/party-popper"
import { useLanguage } from "@/lib/language-context"
import { ShareModal } from "@/components/share-modal"
import { generateShareLink } from "@/lib/countdowns"
import type { CountdownEntry } from "@/lib/types"

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

const categoryLabels: Record<string, { pt: string; en: string }> = {
  viagem:      { pt: "Viagem",     en: "Travel" },
  aniversario: { pt: "Aniversário",en: "Birthday" },
  casamento:   { pt: "Casamento",  en: "Wedding" },
  formatura:   { pt: "Formatura",  en: "Graduation" },
  festa:       { pt: "Festa",      en: "Party" },
  bebe:        { pt: "Nascimento", en: "Baby" },
  show:        { pt: "Show",       en: "Concert" },
  conquista:   { pt: "Conquista",  en: "Achievement" },
  evento:      { pt: "Evento",     en: "Event" },
  outro:       { pt: "Outro",      en: "Other" },
}

function getDaysRemaining(date: string): number {
  const target = new Date(date + "T23:59:59").getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((target - now) / 86400000))
}

function formatDate(date: string, language: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(
    language === "pt" ? "pt-BR" : "en-US",
    { day: "2-digit", month: "short", year: "numeric" }
  )
}

interface CountdownListProps {
  countdowns: CountdownEntry[]
  onOpen: (entry: CountdownEntry) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function CountdownList({ countdowns, onOpen, onNew, onDelete }: CountdownListProps) {
  const { language } = useLanguage()
  const [shareTarget, setShareTarget] = useState<CountdownEntry | null>(null)
  const [local, setLocal] = useState<CountdownEntry[]>(countdowns)
  const removedRef = useRef<Set<string>>(new Set())

  // Sync when parent array changes — skip any locally removed items
  useEffect(() => {
    setLocal(countdowns.filter((c) => !removedRef.current.has(c.id)))
  }, [countdowns])

  function handleDelete(id: string) {
    // Remove from local state immediately — AnimatePresence handles the exit animation
    removedRef.current.add(id)
    setLocal((prev) => prev.filter((c) => c.id !== id))
    // Notify parent (may trigger async DB delete)
    onDelete(id)
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

  const labels = {
    title: language === "pt" ? "Minhas contagens" : "My countdowns",
    new: language === "pt" ? "Nova contagem" : "New countdown",
    days: (n: number) =>
      language === "pt"
        ? n === 0 ? "Hoje!" : n === 1 ? "1 dia" : `${n} dias`
        : n === 0 ? "Today!" : n === 1 ? "1 day" : `${n} days`,
    share:  language === "pt" ? "Compartilhar" : "Share",
    delete: language === "pt" ? "Excluir"  : "Delete",
  }

  return (
    <div className="min-h-dvh px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
      {/* Header */}
      <div className="mx-auto max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="mb-8 text-2xl font-bold tracking-tight text-foreground"
        >
          {labels.title}
        </motion.h1>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {(local.length > 0 ? local : countdowns).map((entry, i) => {
              const days = getDaysRemaining(entry.date)
              const catLabel = (categoryLabels[entry.category] ?? categoryLabels.outro)[language]
              const isFinished = days === 0

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
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 hover:shadow-md cursor-pointer"
                  onClick={() => onOpen(entry)}
                >
                  {/* Top accent bar */}
                  <div
                    className={`h-1 w-full ${
                      isFinished
                        ? "bg-primary"
                        : days <= 7
                        ? "bg-amber-500"
                        : "bg-primary/30"
                    }`}
                  />

                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                    {/* Category + actions row */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        <CategoryIcon id={entry.category} className="size-3" />
                        <span className="text-[10px] font-medium uppercase tracking-wider leading-none">
                          {catLabel}
                        </span>
                      </div>

                      {/* Hover actions */}
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(entry) }}
                          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label={labels.share}
                        >
                          <Share2 className="size-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={labels.delete}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Days counter */}
                    <div className="mb-3 flex flex-col items-center py-2">
                      <span
                        className={`text-4xl font-bold tabular-nums tracking-tight sm:text-5xl ${
                          isFinished
                            ? "text-primary"
                            : days <= 7
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                        }`}
                      >
                        {isFinished ? "!" : days}
                      </span>
                      <span className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        {isFinished
                          ? (language === "pt" ? "Chegou!" : "It's here!")
                          : labels.days(days).replace(/^\d+\s*/, "")}
                      </span>
                    </div>

                    {/* Title + date */}
                    <div className="mt-auto text-center">
                      <p className="truncate text-sm font-semibold text-foreground leading-snug">
                        {entry.title}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {formatDate(entry.date, language)}
                      </p>
                    </div>
                  </div>

                  {/* Mobile actions row */}
                  <div className="flex items-center border-t border-border/60 sm:hidden">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(entry) }}
                      className="flex flex-1 items-center justify-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Share2 className="size-3" />
                    </button>
                    <div className="h-4 w-px bg-border/60" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                      className="flex flex-1 items-center justify-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
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
        {labels.new}
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
