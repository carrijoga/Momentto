"use client"

import { motion, AnimatePresence } from "motion/react"
import { useConnectivity } from "@/lib/connectivity-context"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount } = useConnectivity()
  const { language } = useLanguage()

  const show = !isOnline || isSyncing
  const isSyncingNow = isSyncing && isOnline

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium",
            isSyncingNow
              ? "bg-primary/90 text-primary-foreground"
              : "bg-amber-500/90 text-white"
          )}
        >
          {isSyncingNow ? (
            <>
              <span className="inline-block size-2 rounded-full bg-white/60 animate-pulse" />
              {language === "pt" ? "Sincronizando alterações..." : "Syncing changes..."}
            </>
          ) : (
            <>
              <span className="inline-block size-2 rounded-full bg-white/70" />
              {language === "pt"
                ? "Você está offline. Alterações serão salvas ao reconectar."
                : "You're offline. Changes will be saved when you reconnect."}
              {pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 tabular-nums">
                  {pendingCount}
                </span>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
