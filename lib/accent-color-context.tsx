"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const STORAGE_KEY = "mytrip-accent-hue"
const DEFAULT_HUE = 165

export interface AccentColor {
  hue: number
  label: string
  labelEn: string
  /** Approximate hex used only for the swatch preview */
  swatch: string
}

export const ACCENT_COLORS: AccentColor[] = [
  { hue: 165, label: "Verde",   labelEn: "Green",  swatch: "#22c88a" },
  { hue: 195, label: "Ciano",   labelEn: "Cyan",   swatch: "#22b8c8" },
  { hue: 230, label: "Azul",    labelEn: "Blue",   swatch: "#2277d4" },
  { hue: 265, label: "Índigo",  labelEn: "Indigo", swatch: "#6a41d4" },
  { hue: 290, label: "Roxo",    labelEn: "Purple", swatch: "#9b41d4" },
  { hue: 330, label: "Rosa",    labelEn: "Pink",   swatch: "#d441a0" },
  { hue: 20,  label: "Vermelho",labelEn: "Red",    swatch: "#d44141" },
  { hue: 50,  label: "Laranja", labelEn: "Orange", swatch: "#d48641" },
]

type AccentColorContextType = {
  accentHue: number
  setAccentHue: (hue: number, userId?: string | null) => void
  colors: AccentColor[]
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined)

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accentHue, setAccentHueState] = useState<number>(DEFAULT_HUE)

  // Apply hue to the document root whenever it changes
  const applyHue = useCallback((hue: number) => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent-hue", String(hue))
    }
  }, [])

  // On mount: read from localStorage immediately to avoid flash
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const hue = Number(saved)
      if (!Number.isNaN(hue)) {
        setAccentHueState(hue)
        applyHue(hue)
      }
    }
  }, [applyHue])

  // Load from Supabase when the user's identity is known
  const loadFromServer = useCallback(
    async (userId: string) => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("user_preferences")
          .select("accent_hue")
          .eq("user_id", userId)
          .maybeSingle()

        if (!error && data?.accent_hue != null) {
          const hue = Number(data.accent_hue)
          setAccentHueState(hue)
          applyHue(hue)
          localStorage.setItem(STORAGE_KEY, String(hue))
        }
      } catch {
        // silent — localStorage value remains
      }
    },
    [applyHue]
  )

  const setAccentHue = useCallback(
    (hue: number, userId?: string | null) => {
      setAccentHueState(hue)
      applyHue(hue)
      localStorage.setItem(STORAGE_KEY, String(hue))

      if (userId) {
        const supabase = getSupabaseBrowserClient()
        supabase
          .from("user_preferences")
          .upsert({ user_id: userId, accent_hue: hue, updated_at: new Date().toISOString() })
          .then(() => {/* fire and forget */})
      }
    },
    [applyHue]
  )

  return (
    <AccentColorContext.Provider
      value={{ accentHue, setAccentHue, colors: ACCENT_COLORS }}
    >
      {/* Inline script to apply hue before first paint (avoids flash on refresh) */}
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var h=localStorage.getItem('${STORAGE_KEY}');if(h)document.documentElement.style.setProperty('--accent-hue',h);}catch(e){}})()`,
        }}
      />
      {children}
    </AccentColorContext.Provider>
  )
}

export function useAccentColor() {
  const ctx = useContext(AccentColorContext)
  if (!ctx) throw new Error("useAccentColor must be used within AccentColorProvider")
  return ctx
}

/** Call this when you have a userId to hydrate the server-saved preference. */
export function useAccentColorServerSync(userId: string | null) {
  const { setAccentHue } = useAccentColor()

  useEffect(() => {
    if (!userId) return

    const fetchPref = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("user_preferences")
          .select("accent_hue")
          .eq("user_id", userId)
          .maybeSingle()

        if (!error && data?.accent_hue != null) {
          const hue = Number(data.accent_hue)
          setAccentHue(hue) // don't pass userId to avoid circular upsert
          document.documentElement.style.setProperty("--accent-hue", String(hue))
          localStorage.setItem(STORAGE_KEY, String(hue))
        }
      } catch {
        // keep local value
      }
    }

    fetchPref()
  }, [userId, setAccentHue])
}
