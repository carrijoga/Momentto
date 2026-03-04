"use client"

import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CountdownSetup } from "@/components/countdown-setup"
import { CountdownDisplay } from "@/components/countdown-display"
import { HomeScreen } from "@/components/home-screen"
import { CountdownList } from "@/components/countdown-list"
import { FloatingControls } from "@/components/floating-controls"
import { Spinner } from "@/components/ui/spinner"
import { InstallPrompt } from "@/components/install-prompt"
import { useAuth } from "@/lib/auth-context"
import { useActiveCountdown } from "@/lib/active-countdown-context"
import { useTranslations } from "next-intl"
import {
  fetchCountdowns,
  createCountdown,
  updateCountdown,
  deleteCountdown,
} from "@/lib/countdowns"
import { getAllCountdownsFromDB, migrateLegacyCache, migrateLegacyDb } from "@/lib/db"
import type { CountdownEntry } from "@/lib/types"

type View = "list" | "setup" | "display"

const LEGACY_KEY = "countdown-data"

const viewTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
}

export default function Home() {
  const { userId, loading: authLoading, error: authError, isLocalMode, retry } = useAuth()
  const { setActiveCountdown } = useActiveCountdown()
  const t = useTranslations("auth")

  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>("list")
  const [countdowns, setCountdowns] = useState<CountdownEntry[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CountdownEntry | null>(null)
  const [displayEntry, setDisplayEntry] = useState<CountdownEntry | null>(null)

  // ── Load countdowns from Supabase once authenticated ──────────────────────
  const loadCountdowns = useCallback(async () => {
    setLoadingData(true)
    try {
      const entries = await fetchCountdowns()
      setCountdowns(entries)

      // Migrate legacy single-countdown format
      try {
        const raw = localStorage.getItem(LEGACY_KEY)
        if (raw) {
          const legacy = JSON.parse(raw)
          if (
            legacy?.category &&
            legacy?.title &&
            legacy?.date &&
            !entries.some((e) => e.title === legacy.title && e.date === legacy.date)
          ) {
            const created = await createCountdown({
              category: legacy.category,
              title: legacy.title,
              date: legacy.date,
              time: legacy.time ?? null,
              created_at: legacy.createdAt ?? new Date().toISOString(),
            })
            setCountdowns((prev) => [created, ...prev])
          }
          localStorage.removeItem(LEGACY_KEY)
        }
      } catch {
        // ignore migration errors
      }
    } catch {
      const cached = await getAllCountdownsFromDB()
      if (cached.length > 0) setCountdowns(cached)
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    // Migrate IDB: mytrip-db -> momentto-db (one-time)
    migrateLegacyDb().then(() =>
      // Migrate localStorage cache -> IDB (one-time)
      migrateLegacyCache()
    ).then(async () => {
      const cached = await getAllCountdownsFromDB()
      if (cached.length > 0) setCountdowns(cached)
    }).catch(console.error)
  }, [])

  // Re-fetch after a sync completes (temp IDs replaced with real ones)
  useEffect(() => {
    const handleSynced = () => loadCountdowns()
    window.addEventListener("countdowns-synced", handleSynced)
    return () => window.removeEventListener("countdowns-synced", handleSynced)
  }, [loadCountdowns])

  useEffect(() => {
    if (userId || isLocalMode) loadCountdowns()
  }, [userId, isLocalMode, loadCountdowns])

  // ── Navigation helpers ────────────────────────────────────────────────────
  function openDisplay(entry: CountdownEntry) {
    setDisplayEntry(entry)
    setActiveCountdown(entry)
    setView("display")
  }

  function openSetup(entry?: CountdownEntry) {
    setEditingEntry(entry ?? null)
    setView("setup")
  }

  function goToList() {
    setDisplayEntry(null)
    setEditingEntry(null)
    setActiveCountdown(null)
    setView("list")
  }

  // ── Setup completion ──────────────────────────────────────────────────────
  async function handleSetupComplete(incoming: {
    category: string
    title: string
    date: string
    time?: string
    createdAt: string
  }) {
    try {
      if (editingEntry) {
        const updated = await updateCountdown(editingEntry.id, {
          category: incoming.category,
          title: incoming.title,
          date: incoming.date,
          time: incoming.time ?? null,
        })
        setCountdowns((prev) =>
          prev.map((c) => (c.id === editingEntry.id ? updated : c))
        )
        openDisplay(updated)
      } else {
        const created = await createCountdown({
          category: incoming.category,
          title: incoming.title,
          date: incoming.date,
          time: incoming.time ?? null,
          created_at: incoming.createdAt,
        })
        setCountdowns((prev) => [created, ...prev])
        openDisplay(created)
      }
    } catch (e) {
      console.error("Failed to save countdown:", e)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await deleteCountdown(id)
      setCountdowns((prev) => prev.filter((c) => c.id !== id))
      if (displayEntry?.id === id) goToList()
    } catch (e) {
      console.error("Failed to delete countdown:", e)
    }
  }

  // ── Share link patch ──────────────────────────────────────────────────────
  function handleShareGenerated(updated: CountdownEntry) {
    setCountdowns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setDisplayEntry(updated)
    setActiveCountdown(updated)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = !mounted || (authLoading && !isLocalMode) || (loadingData && countdowns.length === 0)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (authError && !isLocalMode) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("sessionError")}
        </p>
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-xs font-mono text-destructive">
          {authError}
        </p>
        <button
          onClick={retry}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          {t("retry")}
        </button>
      </div>
    )
  }

  return (
    <>
      <FloatingControls currentView={view} onShareGenerated={handleShareGenerated} />
      <InstallPrompt />

      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div key="list" {...viewTransition}>
            {countdowns.length === 0 ? (
              <HomeScreen onStart={() => openSetup()} />
            ) : (
              <CountdownList
                countdowns={countdowns}
                onOpen={openDisplay}
                onNew={() => openSetup()}
                onDelete={handleDelete}
              />
            )}
          </motion.div>
        )}

        {view === "setup" && (
          <motion.div key="setup" {...viewTransition}>
            <CountdownSetup
              initialCategory={editingEntry?.category}
              initialTitle={editingEntry?.title}
              initialDate={editingEntry?.date}
              initialTime={editingEntry?.time ?? undefined}
              onComplete={handleSetupComplete}
              onBack={goToList}
            />
          </motion.div>
        )}

        {view === "display" && displayEntry && (
          <motion.div key="display" {...viewTransition}>
            <CountdownDisplay
              key={displayEntry.id}
              entry={displayEntry}
              onEdit={() => openSetup(displayEntry)}
              onReset={goToList}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
