"use client"

import { useRef, useState, useEffect } from "react"
import type { ElementType } from "react"
import { motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import NumberFlow from "@number-flow/react"
import { AirplaneIcon, type AirplaneIconHandle } from "@/components/ui/airplane"
import {
  ArrowRight,
  Plane,
  Heart,
  GraduationCap,
  PartyPopper,
  Star,
  Calendar,
  Music,
  MapPin,
  Gift,
  Camera,
  Sparkles,
  Trophy,
  Rocket,
  Clock,
  Cake,
  Umbrella,
  Compass,
  Flame,
  Zap,
  Smile,
  Sun,
  Bell,
  WifiOff,
  Share2,
  Globe,
} from "lucide-react"

// ── Motion helpers ────────────────────────────────────────────────────────────

type MotionType = "floatY" | "slideLR" | "slideTB" | "driftDiag1" | "driftDiag2"

const MOTION_TYPES: MotionType[] = ["floatY", "slideLR", "slideTB", "driftDiag1", "driftDiag2"]

function getMotionAnimation(type: MotionType) {
  switch (type) {
    case "floatY":     return { y: [0, -18, 0] }
    case "slideLR":    return { x: [0, 22, 0] }
    case "slideTB":    return { y: [0, 22, 0] }
    case "driftDiag1": return { x: [0, 16, -10, 0], y: [0, -14, 12, 0] }
    case "driftDiag2": return { x: [0, -14, 12, 0], y: [0, 16, -10, 0] }
  }
}

interface ScatteredIcon {
  Icon: ElementType
  top?: string
  bottom?: string
  left?: string
  right?: string
  size: number
  opacity: number
  duration: number
  delay: number
}

const scattered: ScatteredIcon[] = [
  { Icon: Star,          top: "8%",    left: "12%",  size: 30, opacity: 0.10, duration: 7,  delay: 0   },
  { Icon: Sparkles,      top: "5%",    left: "35%",  size: 26, opacity: 0.09, duration: 9,  delay: 0.6 },
  { Icon: Sun,           top: "5%",    right: "35%", size: 26, opacity: 0.08, duration: 8,  delay: 1.4 },
  { Icon: Rocket,        top: "8%",    right: "12%", size: 30, opacity: 0.10, duration: 10, delay: 0.3 },
  { Icon: Plane,         top: "22%",   left: "6%",   size: 32, opacity: 0.10, duration: 8,  delay: 2.0 },
  { Icon: Heart,         top: "18%",   left: "20%",  size: 28, opacity: 0.09, duration: 11, delay: 1.0 },
  { Icon: GraduationCap, top: "18%",   right: "20%", size: 28, opacity: 0.09, duration: 9,  delay: 3.0 },
  { Icon: Music,         top: "22%",   right: "6%",  size: 32, opacity: 0.10, duration: 7,  delay: 1.8 },
  { Icon: Flame,         top: "42%",   left: "5%",   size: 30, opacity: 0.09, duration: 10, delay: 0.5 },
  { Icon: Compass,       top: "38%",   left: "18%",  size: 26, opacity: 0.08, duration: 12, delay: 4.0 },
  { Icon: Zap,           top: "42%",   right: "5%",  size: 30, opacity: 0.09, duration: 9,  delay: 2.5 },
  { Icon: Camera,        top: "38%",   right: "18%", size: 26, opacity: 0.08, duration: 8,  delay: 1.2 },
  { Icon: Gift,          bottom: "22%",left: "6%",   size: 32, opacity: 0.10, duration: 11, delay: 3.5 },
  { Icon: Umbrella,      bottom: "18%",left: "20%",  size: 28, opacity: 0.09, duration: 8,  delay: 0.8 },
  { Icon: MapPin,        bottom: "18%",right: "20%", size: 28, opacity: 0.09, duration: 10, delay: 2.2 },
  { Icon: Trophy,        bottom: "22%",right: "6%",  size: 32, opacity: 0.10, duration: 7,  delay: 1.6 },
  { Icon: Clock,         bottom: "8%", left: "12%",  size: 30, opacity: 0.10, duration: 9,  delay: 4.5 },
  { Icon: Calendar,      bottom: "5%", left: "35%",  size: 26, opacity: 0.08, duration: 11, delay: 0.4 },
  { Icon: Cake,          bottom: "5%", right: "35%", size: 26, opacity: 0.08, duration: 8,  delay: 3.2 },
  { Icon: PartyPopper,   bottom: "8%", right: "12%", size: 30, opacity: 0.10, duration: 10, delay: 1.5 },
  { Icon: Smile,         top: "30%",   left: "32%",  size: 22, opacity: 0.07, duration: 13, delay: 5.0 },
  { Icon: Star,          top: "62%",   right: "32%", size: 22, opacity: 0.07, duration: 9,  delay: 2.8 },
]

// ── Demo countdown ────────────────────────────────────────────────────────────

function getDemoCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  const days    = Math.floor(totalSeconds / 86400)
  const hours   = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function DemoCountdown() {
  const t = useTranslations("landing")
  // Always shows ~45 days from component's first mount
  const [target] = useState(() => new Date(Date.now() + 45 * 24 * 60 * 60 * 1000))
  const [time, setTime] = useState(() => getDemoCountdown(target))

  useEffect(() => {
    const id = setInterval(() => setTime(getDemoCountdown(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units = [
    { val: time.days,    label: t("demo.daysLabel") },
    { val: time.hours,   label: t("demo.hoursLabel") },
    { val: time.minutes, label: t("demo.minutesLabel") },
    { val: time.seconds, label: t("demo.secondsLabel") },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.4 }}
      className="w-full rounded-3xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Plane className="size-3" />
          {t("demo.label")}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {units.map(({ val, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-background/60 p-3">
            <NumberFlow
              value={val}
              className="text-2xl font-bold tabular-nums text-foreground leading-none sm:text-3xl"
              format={{ minimumIntegerDigits: 2 }}
            />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground/60">
        <Share2 className="size-3 shrink-0" />
        <span className="truncate">momentto.carrijoga.com.br</span>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function LandingPage() {
  const t = useTranslations("landing")
  const locale = useLocale()
  const heroAirplaneRef = useRef<AirplaneIconHandle>(null)
  const [sessionMotion, setSessionMotion] = useState<MotionType>(MOTION_TYPES[0])

  useEffect(() => {
    setSessionMotion(MOTION_TYPES[Math.floor(Math.random() * MOTION_TYPES.length)])
  }, [])

  const features = [
    { icon: Globe,   title: t("features.item0.title"), description: t("features.item0.description") },
    { icon: Share2,  title: t("features.item1.title"), description: t("features.item1.description") },
    { icon: Bell,    title: t("features.item2.title"), description: t("features.item2.description") },
    { icon: WifiOff, title: t("features.item3.title"), description: t("features.item3.description") },
  ]

  const steps = [
    { num: "01", title: t("howItWorks.step0.title"), description: t("howItWorks.step0.description") },
    { num: "02", title: t("howItWorks.step1.title"), description: t("howItWorks.step1.description") },
    { num: "03", title: t("howItWorks.step2.title"), description: t("howItWorks.step2.description") },
  ]

  return (
    <div className="min-h-dvh bg-background text-foreground">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <Plane className="size-4 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">Momentto</span>
          </div>
          <Link
            href={`/${locale}/app`}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {t("nav.cta")}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100dvh-49px)] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
        {/* Background floating icons */}
        {scattered.map(({ Icon, top, left, right, bottom, size, opacity, duration, delay }, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ top, left, right, bottom, opacity }}
            animate={getMotionAnimation(sessionMotion)}
            transition={{ repeat: Infinity, repeatType: "loop", duration, delay, ease: "easeInOut" }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Text content */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-6 flex size-20 cursor-default items-center justify-center rounded-[24px] bg-primary/10 ring-1 ring-primary/20 shadow-xl shadow-primary/10"
              onMouseEnter={() => heroAirplaneRef.current?.startAnimation()}
              onMouseLeave={() => heroAirplaneRef.current?.stopAnimation()}
            >
              <AirplaneIcon ref={heroAirplaneRef} size={36} className="text-primary" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
              className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Momentto
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
              className="mb-3 max-w-md text-pretty text-xl font-medium leading-snug text-foreground/80 sm:text-2xl"
            >
              {t("hero.tagline")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
              className="mb-10 max-w-md text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {t("hero.sub")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
            >
              <Link
                href={`/${locale}/app`}
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("hero.cta")}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Demo countdown card */}
          <div className="w-full max-w-sm flex-shrink-0 lg:max-w-xs xl:max-w-sm">
            <DemoCountdown />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("features.title")}</h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 25, delay: i * 0.08 }}
                className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("howItWorks.title")}</h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map(({ num, title, description }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 25, delay: i * 0.1 }}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                  {num}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 px-4 py-20 sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
          <p className="mb-10 text-base text-muted-foreground">{t("cta.sub")}</p>
          <Link
            href={`/${locale}/app`}
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
          >
            {t("cta.button")}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Plane className="size-3.5 text-primary/70" />
            <span className="font-medium">Momentto</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} {t("footer.rights")}</span>
          </div>
          <div className="flex gap-5">
            <Link href={`/${locale}/changelog`} className="transition hover:text-foreground">Changelog</Link>
            <Link href={`/${locale}/app`} className="transition hover:text-foreground">{t("nav.cta")}</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
