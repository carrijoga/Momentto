"use client"

import { useState, useEffect } from "react"
import {
  Cake,
  Baby,
  Music,
  Trophy,
  Calendar,
  Star,
  Trash2,
  Share2,
  ArrowRight,
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

  // Sync when parent array changes (new entries, deletions, or external updates)
  useEffect(() => {
    setLocal(countdowns)
  }, [countdowns])

  async function handleShare(entry: CountdownEntry) {
    // If no share_id yet, generate one before opening modal
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
    open:   language === "pt" ? "Abrir"    : "Open",
    share:  language === "pt" ? "Compartilhar" : "Share",
    delete: language === "pt" ? "Excluir"  : "Delete",
  }

  return (
    <div className="min-h-dvh px-4 pb-28 pt-6 sm:p-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-top-4 duration-500">
          {labels.title}
        </h1>

        {/* Grid */}
        <div className="flex flex-col gap-3">
          {(local.length > 0 ? local : countdowns).map((entry, i) => {
            const days = getDaysRemaining(entry.date)
            const catLabel = (categoryLabels[entry.category] ?? categoryLabels.outro)[language]
            const isFinished = days === 0

            return (
              <div
                key={entry.id}
                className="group relative flex flex-col rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Category icon */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CategoryIcon id={entry.category} className="size-4" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground leading-snug">{entry.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {catLabel} · {formatDate(entry.date, language)}
                    </p>
                  </div>

                  {/* Days badge */}
                  <div
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isFinished
                        ? "bg-primary/15 text-primary"
                        : days <= 7
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {labels.days(days)}
                  </div>
                </div>

                {/* Actions row — always visible on mobile, show on hover on desktop */}
                <div className="flex items-center gap-1 border-t border-border/60 px-3 py-2 sm:border-0 sm:px-3 sm:py-1 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100">
                  <button
                    onClick={() => handleShare(entry)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex-none sm:size-8 sm:p-0"
                  >
                    <Share2 className="size-3.5 shrink-0" />
                    <span className="sm:hidden">{labels.share}</span>
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:flex-none sm:size-8 sm:p-0"
                  >
                    <Trash2 className="size-3.5 shrink-0" />
                    <span className="sm:hidden">{labels.delete}</span>
                  </button>
                  <button
                    onClick={() => onOpen(entry)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 sm:flex-none sm:size-8 sm:p-0"
                  >
                    <ArrowRight className="size-3.5 shrink-0" />
                    <span className="sm:hidden">{labels.open}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* New countdown FAB — bottom-left to mirror FloatingControls on bottom-right */}
      <button
        onClick={onNew}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.97]"
      >
        <Plus className="size-4" />
        {labels.new}
      </button>

      {/* Share modal */}
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
    </div>
  )
}
