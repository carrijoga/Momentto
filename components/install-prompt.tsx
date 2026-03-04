"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTranslations } from "next-intl"
import { X } from "lucide-react"

export function InstallPrompt() {
  const t = useTranslations("install")
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    setDismissed(localStorage.getItem("install-prompt-dismissed") === "true")
  }, [])

  const shouldShow = isIOS && !isStandalone && !dismissed

  const text = t("prompt")
  const addText = t("addToHome")

  function handleDismiss() {
    localStorage.setItem("install-prompt-dismissed", "true")
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="relative rounded-xl border border-border bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg text-sm text-muted-foreground">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="pr-6">
              {text}{" "}
              <span role="img" aria-label="share">{"⎋"}</span>{" "}
              {t("andThen")}{" "}
              <span className="text-foreground font-medium">{addText}</span>
              {" "}
              <span role="img" aria-label="plus">{"+"}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
