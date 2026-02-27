"use client"

import { useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Globe, Sun, Moon, Monitor, Check, ScrollText, Share2, UserRound, LogOut, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { SettingsIcon, type SettingsIconHandle } from "@/components/ui/settings"
import { BellIcon } from "@/components/ui/bell"
import { useLanguage } from "@/lib/language-context"
import { useAccentColor, useAccentColorServerSync } from "@/lib/accent-color-context"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useActiveCountdown } from "@/lib/active-countdown-context"
import { useAuth } from "@/lib/auth-context"
import { ShareModal } from "@/components/share-modal"
import type { CountdownEntry } from "@/lib/types"
import { Separator } from "@/components/ui/separator"

const themes = [
  { value: "light", label: "Claro", labelEn: "Light", Icon: Sun },
  { value: "dark", label: "Escuro", labelEn: "Dark", Icon: Moon },
  { value: "system", label: "Sistema", labelEn: "System", Icon: Monitor },
]

type CurrentView = "list" | "setup" | "display"

interface FloatingControlsProps {
  currentView?: CurrentView
  onShareGenerated?: (updated: CountdownEntry) => void
}

export function FloatingControls({ currentView = "list", onShareGenerated }: FloatingControlsProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { accentHue, setAccentHue, colors } = useAccentColor()
  const settingsRef = useRef<SettingsIconHandle>(null)
  const { isSupported, subscription, loading, subscribeToPush, unsubscribeFromPush } = usePushNotifications()
  const { activeCountdown, setActiveCountdown } = useActiveCountdown()
  const { isAnonymous, userEmail, signOut, userId } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useAccentColorServerSync(userId)

  // Conditional visibility
  const showConfig = currentView === "list" || currentView === "display"
  const showShare = currentView === "display" && !!activeCountdown

  // Hide entirely on setup (no buttons to show)
  if (!showConfig && !showShare) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Share button -- only on display view */}
      <AnimatePresence>
        {showShare && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setShareOpen(true)}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-lg backdrop-blur-md transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={language === "pt" ? "Compartilhar" : "Share"}
          >
            <Share2 size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Config FAB */}
      <AnimatePresence>
        {showConfig && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: menuOpen ? 90 : 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onMouseEnter={() => {
              if (isAnonymous && !menuOpen) settingsRef.current?.startAnimation()
            }}
            onMouseLeave={() => {
              if (isAnonymous && !menuOpen) settingsRef.current?.stopAnimation()
            }}
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex size-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              menuOpen
                ? "border-primary bg-primary text-primary-foreground shadow-primary/25"
                : isAnonymous
                  ? "border-border bg-card/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  : "border-primary/40 bg-card/80 text-primary hover:border-primary"
            }`}
            aria-label={language === "pt" ? "Menu" : "Menu"}
          >
            {menuOpen ? (
              <X size={18} />
            ) : isAnonymous ? (
              <SettingsIcon ref={settingsRef} size={18} />
            ) : (
              <UserRound size={18} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded config panel */}
      <AnimatePresence>
        {menuOpen && showConfig && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[-1]"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-16 right-0 w-60 overflow-hidden rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-xl"
            >
              {/* Account */}
              {isAnonymous ? (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                >
                  <UserRound className="size-3.5" />
                  {language === "pt" ? "Entrar para sincronizar" : "Sign in to sync"}
                </Link>
              ) : (
                <>
                  <p className="mb-2 truncate text-xs font-medium text-foreground">{userEmail}</p>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false) }}
                    className="mb-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="size-3.5" />
                    {language === "pt" ? "Sair" : "Sign out"}
                  </button>
                </>
              )}

              {isSupported && (
                <>
                  <Separator className="my-2" />
                  <button
                    onClick={subscription ? unsubscribeFromPush : subscribeToPush}
                    disabled={loading}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  >
                    <BellIcon className={subscription ? "text-primary" : ""} size={14} />
                    {subscription
                      ? language === "pt" ? "Notificações ativas" : "Notifications on"
                      : language === "pt" ? "Ativar notificações" : "Enable notifications"}
                  </button>
                </>
              )}

              <Separator className="my-2.5" />

              {/* Language */}
              <div className="mb-2.5">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Globe className="size-3.5" />
                  {language === "pt" ? "Idioma" : "Language"}
                </p>
                <div className="flex gap-1.5">
                  {(["pt", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                        language === lang
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-2.5" />

              {/* Changelog */}
              <Link
                href="/changelog"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <ScrollText className="size-3.5" />
                <span>Changelog</span>
              </Link>

              <Separator className="my-2.5" />

              {/* Accent color */}
              <div className="mb-2.5">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {language === "pt" ? "Cor de destaque" : "Accent color"}
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {colors.map((color) => (
                    <motion.button
                      key={color.hue}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title={language === "pt" ? color.label : color.labelEn}
                      onClick={() => setAccentHue(color.hue, userId)}
                      className="group relative flex h-7 w-full items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ backgroundColor: color.swatch }}
                      aria-label={language === "pt" ? color.label : color.labelEn}
                    >
                      <AnimatePresence>
                        {accentHue === color.hue && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Check className="size-3 text-white drop-shadow" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Separator className="my-2.5" />

              {/* Theme */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {language === "pt" ? "Tema" : "Theme"}
                </p>
                <div className="flex flex-col gap-1">
                  {themes.map(({ value, label, labelEn, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        theme === value
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{language === "pt" ? label : labelEn}</span>
                      {theme === value && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="ml-auto"
                        >
                          <Check className="size-3 text-primary" />
                        </motion.span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareOpen && activeCountdown && (
          <ShareModal
            entry={activeCountdown}
            onClose={() => setShareOpen(false)}
            onShareGenerated={(updated) => {
              setActiveCountdown(updated)
              onShareGenerated?.(updated)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
