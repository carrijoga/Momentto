"use client"

import { motion, AnimatePresence } from "motion/react"
import { useConnectivity } from "@/lib/connectivity-context"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount } = useConnectivity()
  const t = useTranslations("offline")

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
          {t("syncing")}
            </>
          ) : (
            <>
              <span className="inline-block size-2 rounded-full bg-white/70" />
              {t("offline")}
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
