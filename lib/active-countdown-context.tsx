"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"
import type { CountdownEntry } from "@/lib/types"

type ActiveCountdownContextType = {
  activeCountdown: CountdownEntry | null
  setActiveCountdown: Dispatch<SetStateAction<CountdownEntry | null>>
}

const ActiveCountdownContext = createContext<ActiveCountdownContextType | undefined>(
  undefined
)

export function ActiveCountdownProvider({ children }: { children: ReactNode }) {
  const [activeCountdown, setActiveCountdown] = useState<CountdownEntry | null>(null)

  return (
    <ActiveCountdownContext.Provider value={{ activeCountdown, setActiveCountdown }}>
      {children}
    </ActiveCountdownContext.Provider>
  )
}

export function useActiveCountdown() {
  const ctx = useContext(ActiveCountdownContext)
  if (!ctx) throw new Error("useActiveCountdown must be used within ActiveCountdownProvider")
  return ctx
}
