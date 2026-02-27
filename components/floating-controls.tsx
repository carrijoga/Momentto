"use client"

import { useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Globe, Sun, Moon, Monitor, Check, ScrollText, Share2, UserRound, LogOut } from "lucide-react"
import Link from "next/link"
import { SettingsIcon, type SettingsIconHandle } from "@/components/ui/settings"
import { BellIcon } from "@/components/ui/bell"
import { useLanguage } from "@/lib/language-context"
import { useAccentColor, useAccentColorServerSync } from "@/lib/accent-color-context"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useActiveCountdown } from "@/lib/active-countdown-context"
import { useAuth } from "@/lib/auth-context"
import { ShareModal } from "@/components/share-modal"
import type { CountdownEntry } from "@/lib/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const themes = [
  { value: "light", label: "Claro", labelEn: "Light", Icon: Sun },
  { value: "dark", label: "Escuro", labelEn: "Dark", Icon: Moon },
  { value: "system", label: "Sistema", labelEn: "System", Icon: Monitor },
]

export function FloatingControls({ onShareGenerated }: { onShareGenerated?: (updated: CountdownEntry) => void }) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { accentHue, setAccentHue, colors } = useAccentColor()
  const settingsRef = useRef<SettingsIconHandle>(null)
  const { isSupported, subscription, loading, subscribeToPush, unsubscribeFromPush } = usePushNotifications()
  const { activeCountdown, setActiveCountdown } = useActiveCountdown()
  const { isAnonymous, userEmail, signOut, userId } = useAuth()
  const [shareOpen, setShareOpen] = useState(false)

  // Sync server-saved accent color when user is authenticated
  useAccentColorServerSync(userId)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            onMouseEnter={() => {
              if (isAnonymous) settingsRef.current?.startAnimation()
            }}
            onMouseLeave={() => {
              if (isAnonymous) settingsRef.current?.stopAnimation()
            }}
            className={`flex size-11 items-center justify-center rounded-full border bg-card shadow-lg transition-all hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isAnonymous
                ? "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                : "border-primary/40 text-primary hover:border-primary"
            }`}
            aria-label={language === "pt" ? "Menu" : "Menu"}
          >
            {isAnonymous ? (
              <SettingsIcon ref={settingsRef} size={18} />
            ) : (
              <UserRound size={18} />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-56 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Account */}
          {isAnonymous ? (
            <Link
              href="/login"
              className="mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <UserRound className="size-3.5" />
              {language === "pt" ? "Entrar para sincronizar" : "Sign in to sync"}
            </Link>
          ) : (
            <>
              <p className="mb-2 truncate text-xs font-medium text-foreground">{userEmail}</p>
              <button
                onClick={signOut}
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
                aria-label={
                  subscription
                    ? language === "pt" ? "Desativar notificações" : "Disable notifications"
                    : language === "pt" ? "Ativar notificações" : "Enable notifications"
                }
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
              <button
                onClick={() => setLanguage("pt")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                  language === "pt"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                  language === "en"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <Separator className="my-2.5" />

          {/* Changelog */}
          <Link
            href="/changelog"
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
                <button
                  key={color.hue}
                  title={language === "pt" ? color.label : color.labelEn}
                  onClick={() => setAccentHue(color.hue, userId)}
                  className="group relative flex h-7 w-full items-center justify-center rounded-lg transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: color.swatch }}
                  aria-label={language === "pt" ? color.label : color.labelEn}
                >
                  {accentHue === color.hue && (
                    <Check className="size-3 text-white drop-shadow" />
                  )}
                </button>
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
                    <Check className="ml-auto size-3 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Share button — only when viewing a countdown */}
      {activeCountdown && (
        <button
          onClick={() => setShareOpen(true)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-all hover:border-primary/50 hover:text-foreground hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={language === "pt" ? "Compartilhar" : "Share"}
        >
          <Share2 size={18} />
        </button>
      )}

      {/* Share modal */}
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
    </div>
  )
}
