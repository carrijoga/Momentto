"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "pt" | "en"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")

  useEffect(() => {
    // Read new key first; fall back to legacy key and migrate
    const savedLanguage = (
      localStorage.getItem("momentto-language") ??
      localStorage.getItem("mytrip-language")
    ) as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
      localStorage.setItem("momentto-language", savedLanguage)
      localStorage.removeItem("mytrip-language")
    }
  }, [])

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("momentto-language", newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
} 