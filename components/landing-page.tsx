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
  CheckCircle2,
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
  { Icon: Star,          top: "8%",    left: "12%",  size: 30, opacity: 0.08, duration: 7,  delay: 0   },
  { Icon: Sparkles,      top: "5%",    left: "35%",  size: 26, opacity: 0.07, duration: 9,  delay: 0.6 },
  { Icon: Sun,           top: "5%",    right: "35%", size: 26, opacity: 0.06, duration: 8,  delay: 1.4 },
  { Icon: Rocket,        top: "8%",    right: "12%", size: 30, opacity: 0.08, duration: 10, delay: 0.3 },
  { Icon: Plane,         top: "22%",   left: "6%",   size: 32, opacity: 0.08, duration: 8,  delay: 2.0 },
  { Icon: Heart,         top: "18%",   left: "20%",  size: 28, opacity: 0.07, duration: 11, delay: 1.0 },
  { Icon: GraduationCap, top: "18%",   right: "20%", size: 28, opacity: 0.07, duration: 9,  delay: 3.0 },
  { Icon: Music,         top: "22%",   right: "6%",  size: 32, opacity: 0.08, duration: 7,  delay: 1.8 },
  { Icon: Flame,         top: "42%",   left: "5%",   size: 30, opacity: 0.07, duration: 10, delay: 0.5 },
  { Icon: Compass,       top: "38%",   left: "18%",  size: 26, opacity: 0.06, duration: 12, delay: 4.0 },
  { Icon: Zap,           top: "42%",   right: "5%",  size: 30, opacity: 0.07, duration: 9,  delay: 2.5 },
  { Icon: Camera,        top: "38%",   right: "18%", size: 26, opacity: 0.06, duration: 8,  delay: 1.2 },
  { Icon: Gift,          bottom: "22%",left: "6%",   size: 32, opacity: 0.08, duration: 11, delay: 3.5 },
  { Icon: Umbrella,      bottom: "18%",left: "20%",  size: 28, opacity: 0.07, duration: 8,  delay: 0.8 },
  { Icon: MapPin,        bottom: "18%",right: "20%", size: 28, opacity: 0.07, duration: 10, delay: 2.2 },
  { Icon: Trophy,        bottom: "22%",right: "6%",  size: 32, opacity: 0.08, duration: 7,  delay: 1.6 },
  { Icon: Clock,         bottom: "8%", left: "12%",  size: 30, opacity: 0.08, duration: 9,  delay: 4.5 },
  { Icon: Calendar,      bottom: "5%", left: "35%",  size: 26, opacity: 0.06, duration: 11, delay: 0.4 },
  { Icon: Cake,          bottom: "5%", right: "35%", size: 26, opacity: 0.06, duration: 8,  delay: 3.2 },
  { Icon: PartyPopper,   bottom: "8%", right: "12%", size: 30, opacity: 0.08, duration: 10, delay: 1.5 },
  { Icon: Smile,         top: "30%",   left: "32%",  size: 22, opacity: 0.05, duration: 13, delay: 5.0 },
  { Icon: Star,          top: "62%",   right: "32%", size: 22, opacity: 0.05, duration: 9,  delay: 2.8 },
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
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.5 }}
      className="w-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl shadow-black/10"
    >
      {/* Card header */}
      <div className="border-b border-border/40 bg-secondary/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
              <Plane className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("demo.label")}</p>
              <p className="text-[11px] text-muted-foreground">momentto.app</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Ao vivo
          </span>
        </div>
      </div>

      {/* Countdown grid */}
      <div className="p-5">
        <div className="grid grid-cols-4 gap-2.5">
          {units.map(({ val, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary/50 p-3"
            >
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

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progresso</span>
            <span>12% concluído</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[12%] rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Shared pill */}
      <div className="flex items-center gap-2 border-t border-border/40 px-5 py-3 text-[11px] text-muted-foreground/70">
        <Share2 className="size-3 shrink-0 text-primary/60" />
        <span className="truncate">Compartilhado com 3 pessoas</span>
      </div>
    </motion.div>
  )
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: ElementType
  title: string
  description: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.08 }}
      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────

function StepCard({
  num,
  title,
  description,
  index,
}: {
  num: string
  title: string
  description: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.1 }}
      className="relative flex gap-5"
    >
      {/* Step number */}
      <div className="flex flex-col items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/25">
          {num}
        </div>
        {index < 2 && (
          <div className="mt-2 h-full w-px bg-border/60" />
        )}
      </div>
      {/* Content */}
      <div className="pb-10">
        <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
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
    { num: "1", title: t("howItWorks.step0.title"), description: t("howItWorks.step0.description") },
    { num: "2", title: t("howItWorks.step1.title"), description: t("howItWorks.step1.description") },
    { num: "3", title: t("howItWorks.step2.title"), description: t("howItWorks.step2.description") },
  ]

  const useCases = [
    { icon: Plane,         label: "Viagens" },
    { icon: Heart,         label: "Casamentos" },
    { icon: GraduationCap, label: "Formaturas" },
    { icon: PartyPopper,   label: "Festas" },
    { icon: Cake,          label: "Aniversários" },
    { icon: Music,         label: "Shows" },
    { icon: Trophy,        label: "Conquistas" },
    { icon: Gift,          label: "Eventos" },
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

        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
          {/* Text content */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3.5 py-1.5"
            >
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Simples. Rápido. Gratuito.</span>
            </motion.div>

            {/* Logo icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
              className="mb-5 flex size-16 cursor-default items-center justify-center rounded-[20px] bg-primary/10 ring-1 ring-primary/20 shadow-xl shadow-primary/10"
              onMouseEnter={() => heroAirplaneRef.current?.startAnimation()}
              onMouseLeave={() => heroAirplaneRef.current?.stopAnimation()}
            >
              <AirplaneIcon ref={heroAirplaneRef} size={28} className="text-primary" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
              className="mb-5 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              {t("hero.tagline")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.18 }}
              className="mb-8 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {t("hero.sub")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.26 }}
              className="flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <Link
                href={`/${locale}/app`}
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("hero.cta")}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-primary/70" />
                Sem criar conta — comece agora
              </span>
            </motion.div>

            {/* Use case chips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.38 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              {useCases.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  <Icon className="size-3 text-primary/70" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Demo countdown card */}
          <div className="w-full max-w-[340px] flex-shrink-0">
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
            className="mb-4 text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Funcionalidades
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.05 }}
            className="mb-12 text-center"
          >
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t("features.title")}</h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon, title, description }, i) => (
              <FeatureCard key={title} icon={icon} title={title} description={description} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-center">
            {/* Left: steps */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="mb-4"
              >
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Como funciona
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.05 }}
                className="mb-10 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {t("howItWorks.title")}
              </motion.h2>

              <div className="flex flex-col">
                {steps.map(({ num, title, description }, i) => (
                  <StepCard key={num} num={num} title={title} description={description} index={i} />
                ))}
              </div>
            </div>

            {/* Right: visual */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 180, damping: 25, delay: 0.15 }}
              className="hidden lg:block"
            >
              <div className="rounded-3xl border border-border/60 bg-card p-8">
                <div className="mb-6 flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-amber-400/60" />
                  <span className="size-2.5 rounded-full bg-primary/60" />
                </div>

                {/* Mini countdown demo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Plane className="size-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Viagem para Europa</p>
                      <p className="text-xs text-muted-foreground">15 jun. 2025</p>
                    </div>
                    <span className="text-2xl font-bold text-foreground tabular-nums">87</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10">
                      <Heart className="size-4 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Casamento da Ana</p>
                      <p className="text-xs text-muted-foreground">22 ago. 2025</p>
                    </div>
                    <span className="text-2xl font-bold text-foreground tabular-nums">155</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-4 opacity-70">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                      <GraduationCap className="size-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Formatura de Med</p>
                      <p className="text-xs text-muted-foreground">12 dez. 2025</p>
                    </div>
                    <span className="text-2xl font-bold text-foreground tabular-nums">297</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center">
                  <span className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/30">
                    <Star className="size-3" />
                    Nova contagem
                  </span>
                </div>
              </div>
            </motion.div>
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
          className="mx-auto max-w-3xl"
        >
          {/* CTA card */}
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-8 py-14 text-center sm:px-16">
            {/* Subtle background tint */}
            <div className="pointer-events-none absolute inset-0 bg-primary/3" />

            <div className="relative">
              <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {t("cta.title")}
              </h2>
              <p className="mb-8 text-base text-muted-foreground">{t("cta.sub")}</p>
              <Link
                href={`/${locale}/app`}
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              >
                {t("cta.button")}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <p className="mt-5 text-xs text-muted-foreground/60">
                Grátis para sempre · Sem criar conta · Funciona offline
              </p>
            </div>
          </div>
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
