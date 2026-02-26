"use client"

import { useEffect, useState } from "react"
import { CountdownSetup } from "@/components/countdown-setup"
import { CountdownDisplay } from "@/components/countdown-display"
import { HomeScreen } from "@/components/home-screen"
import { FloatingControls } from "@/components/floating-controls"
import { Spinner } from "@/components/ui/spinner"
import { InstallPrompt } from "@/components/install-prompt"

interface CountdownData {
  category: string
  title: string
  date: string
  time?: string
  createdAt: string
}

const STORAGE_KEY = "countdown-data"
const LEGACY_KEY = "targetDate"

function loadData(): CountdownData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CountdownData
      if (parsed.category && parsed.title && parsed.date && parsed.createdAt) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  // Clean up legacy key
  localStorage.removeItem(LEGACY_KEY)
  return null
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<CountdownData | null>(null)
  const [showHome, setShowHome] = useState(true)
  // When editing, go back to step 2 (date/title) keeping the category
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    localStorage.removeItem(LEGACY_KEY)
    const saved = loadData()
    setData(saved)
    if (saved) setShowHome(false)
    setMounted(true)
  }, [])

  function handleSetupComplete(incoming: CountdownData) {
    // Preserve original createdAt if editing
    const final: CountdownData = {
      ...incoming,
      createdAt: editMode && data ? data.createdAt : incoming.createdAt,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(final))
    setData(final)
    setEditMode(false)
  }

  function handleEdit() {
    setEditMode(true)
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY)
    setData(null)
    setEditMode(false)
    setShowHome(true)
  }

  function handleBack() {
    if (editMode) {
      setEditMode(false)
    } else {
      setShowHome(true)
    }
  }

  const showControls = mounted && !(showHome && !editMode)

  return (
    <>
      {showControls && <FloatingControls />}
      <InstallPrompt />
      {!mounted ? (
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner />
        </div>
      ) : data && !editMode ? (
        <CountdownDisplay
          category={data.category}
          title={data.title}
          date={data.date}
          time={data.time}
          createdAt={data.createdAt}
          onEdit={handleEdit}
          onReset={handleReset}
        />
      ) : showHome && !editMode ? (
        <HomeScreen onStart={() => setShowHome(false)} />
      ) : (
        <CountdownSetup
          initialCategory={editMode && data ? data.category : undefined}
          initialTitle={editMode && data ? data.title : undefined}
          initialDate={editMode && data ? data.date : undefined}
          initialTime={editMode && data ? data.time : undefined}
          onComplete={handleSetupComplete}
          onBack={handleBack}
        />
      )}
    </>
  )
}



