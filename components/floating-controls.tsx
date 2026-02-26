"use client"

import { useRef } from "react"
import { useTheme } from "next-themes"
import { Globe, Sun, Moon, Monitor, Check, ScrollText } from "lucide-react"
import Link from "next/link"
import { SettingsIcon, type SettingsIconHandle } from "@/components/ui/settings"
import { BellIcon, type BellIconHandle } from "@/components/ui/bell"
import { useLanguage } from "@/lib/language-context"
import { usePushNotifications } from "@/hooks/use-push-notifications"
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

export function FloatingControls() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const settingsRef = useRef<SettingsIconHandle>(null)
  const bellRef = useRef<BellIconHandle>(null)
  const { isSupported, subscription, loading, subscribeToPush, unsubscribeFromPush } = usePushNotifications()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {isSupported && (
        <button
          onClick={subscription ? unsubscribeFromPush : subscribeToPush}
          disabled={loading}
          onMouseEnter={() => bellRef.current?.startAnimation()}
          onMouseLeave={() => bellRef.current?.stopAnimation()}
          className={`flex size-11 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-all hover:border-primary/50 hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
            subscription
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={
            subscription
              ? language === "pt" ? "Desativar notificações" : "Disable notifications"
              : language === "pt" ? "Ativar notificações" : "Enable notifications"
          }
        >
          <BellIcon ref={bellRef} size={18} />
        </button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            onMouseEnter={() => settingsRef.current?.startAnimation()}
            onMouseLeave={() => settingsRef.current?.stopAnimation()}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-all hover:border-primary/50 hover:text-foreground hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Configurações"
          >
            <SettingsIcon ref={settingsRef} size={18} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-52 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
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
    </div>
  )
}
