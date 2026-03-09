"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "motion/react"
import pkg from "@/package.json"
import NumberFlow from "@number-flow/react"
import Confetti from "react-confetti-boom"
import Link from "next/link"
import { Pencil, Cake, Baby, Music, Trophy, Calendar as CalendarLucide, Star } from "lucide-react"
import { RotateCCWIcon, type RotateCCWIconHandle } from "@/components/ui/rotate-ccw"
import { PartyPopperIcon, type PartyPopperIconHandle } from "@/components/ui/party-popper"
import { AirplaneIcon, type AirplaneIconHandle } from "@/components/ui/airplane"
import { HeartIcon, type HeartIconHandle } from "@/components/ui/heart"
import { GraduationCapIcon, type GraduationCapIconHandle } from "@/components/ui/graduation-cap"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import { sendNotification } from "@/app/actions"
import { BlurText } from "@/components/ui/blur-text"
import { GradientText } from "@/components/ui/gradient-text"
import { SpotlightCard } from "@/components/ui/spotlight-card"

interface TimeLeft {
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
}

function calculateTimeLeft(targetDate: string, targetTime?: string): TimeLeft {
  const now = new Date()
  const target = new Date(targetDate + "T" + (targetTime ? targetTime + ":00" : "23:59:59"))
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 }
  }

  const totalMs = diff
  const totalDays = Math.ceil(totalMs / 86400000)

  const nowDate = new Date(now)
  let months = 0
  const tempDate = new Date(nowDate)

  while (true) {
    const nextMonth = new Date(tempDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    if (nextMonth <= target) {
      months++
      tempDate.setMonth(tempDate.getMonth() + 1)
    } else {
      break
    }
  }

  const afterMonths = new Date(nowDate)
  afterMonths.setMonth(afterMonths.getMonth() + months)
  const remainingDiff = target.getTime() - afterMonths.getTime()
  const remainingTotalSeconds = Math.floor(remainingDiff / 1000)
  const remainingTotalMinutes = Math.floor(remainingTotalSeconds / 60)
  const remainingTotalHours = Math.floor(remainingTotalMinutes / 60)
  const remainingDays = Math.floor(remainingTotalHours / 24)
  const remainingHours = remainingTotalHours % 24
  const remainingMinutes = remainingTotalMinutes % 60
  const remainingSeconds = remainingTotalSeconds % 60

  return {
    months,
    days: remainingDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
    totalDays,
  }
}

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const cls = cn("size-4", className)
  switch (id) {
    case "viagem": return <AirplaneIcon size={16} className={cls} />
    case "casamento": return <HeartIcon size={16} className={cls} />
    case "formatura": return <GraduationCapIcon size={16} className={cls} />
    case "festa": return <PartyPopperIcon size={16} className={cls} />
    case "aniversario": return <Cake className={cls} />
    case "bebe": return <Baby className={cls} />
    case "show": return <Music className={cls} />
    case "conquista": return <Trophy className={cls} />
    case "evento": return <CalendarLucide className={cls} />
    default: return <Star className={cls} />
  }
}

function TimeUnit({ value, label, index }: { value: number; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        delay: index * 0.08,
      }}
      className="flex flex-col items-center"
    >
      <SpotlightCard className="relative flex size-20 items-center justify-center rounded-2xl bg-card border border-border font-mono font-bold tabular-nums tracking-tight text-foreground sm:size-28">
        <span className="text-3xl sm:text-5xl">
          <NumberFlow value={value} format={{ minimumIntegerDigits: 2 }} />
        </span>
      </SpotlightCard>
      <span className="mt-2.5 text-xs font-medium uppercase tracking-widest text-muted-foreground sm:text-sm">
        {label}
      </span>
    </motion.div>
  )
}



import type { CountdownEntry } from "@/lib/types"

interface CountdownDisplayProps {
  entry: CountdownEntry
  onReset: () => void
  onEdit: () => void
  onShareGenerated?: (updated: CountdownEntry) => void
  isPublic?: boolean
}

export function CountdownDisplay({
  entry,
  onReset,
  onEdit,
  isPublic = false,
}: CountdownDisplayProps) {
  const { category, title, date, created_at: createdAt } = entry
  const time = entry.time ?? undefined
  const t = useTranslations("countdown")
  const tCat = useTranslations("categories")
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(date, time))
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)

  const resetRef = useRef<RotateCCWIconHandle>(null)
  const partyRef = useRef<PartyPopperIconHandle>(null)
  const notificationSentRef = useRef(false)

  const update = useCallback(() => {
    const next = calculateTimeLeft(date, time)
    setTimeLeft(next)
    if (
      next.months === 0 &&
      next.days === 0 &&
      next.hours === 0 &&
      next.minutes === 0 &&
      next.seconds === 0
    ) {
      setShowConfetti(true)
      if (!notificationSentRef.current && !isPublic) {
        notificationSentRef.current = true
        sendNotification(
          title,
          t("notificationMsg")
        ).catch(console.error)
      }
    }
  }, [date, time, title, t, isPublic])

  useEffect(() => {
    setMounted(true)
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [update])

  const isFinished =
    timeLeft.months === 0 &&
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0

  const formattedDate = (() => {
    const d = new Date(date + "T00:00:00").toLocaleDateString(
      undefined,
      { day: "2-digit", month: "long", year: "numeric" }
    )
    if (!time) return d
    return `${d} ${time}`
  })()

  const catLabel = tCat((category in {viagem:1,aniversario:1,casamento:1,formatura:1,festa:1,bebe:1,show:1,conquista:1,evento:1,outro:1}) ? category as any : "outro")

  const progressPercent = (() => {
    const created = new Date(createdAt).getTime()
    const target = new Date(date + "T" + (time ? time + ":00" : "23:59:59")).getTime()
    const now = Date.now()
    const total = target - created
    if (total <= 0) return 100
    const elapsed = now - created
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  })()

  const totalDaysRemaining = timeLeft.totalDays

  if (!mounted) return null

  const timeUnits = [
    ...(timeLeft.months > 0
      ? [{ value: timeLeft.months, label: timeLeft.months === 1 ? t("month") : t("months") }]
      : []),
    { value: timeLeft.days, label: timeLeft.days === 1 ? t("day") : t("days") },
    { value: timeLeft.hours, label: timeLeft.hours === 1 ? t("hour") : t("hours") },
    { value: timeLeft.minutes, label: timeLeft.minutes === 1 ? t("minute") : t("minutes") },
    { value: timeLeft.seconds, label: timeLeft.seconds === 1 ? t("second") : t("seconds") },
  ]

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          <Confetti mode="boom" particleCount={200} />
        </div>
      )}

      {/* Glow orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-3xl"
      />

      <div className="relative w-full max-w-3xl">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
            <CategoryIcon id={category} />
            <span className="text-xs font-medium uppercase tracking-wider">
              {catLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isPublic && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onEdit}
                  className="flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:gap-2 sm:px-4"
                  aria-label={t("edit")}
                >
                  <Pencil className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t("edit")}</span>
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => resetRef.current?.startAnimation()}
                  onMouseLeave={() => resetRef.current?.stopAnimation()}
                  onClick={onReset}
                  className="flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:gap-2 sm:px-4"
                  aria-label={t("back")}
                >
                  <RotateCCWIcon ref={resetRef} size={14} className="shrink-0" />
                  <span className="hidden sm:inline">{t("back")}</span>
                </motion.button>
              </>
            )}
            {isPublic && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {t("publicView")}
              </span>
            )}
          </div>
        </motion.div>

        {/* Glass card */}
        <SpotlightCard className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 px-6 py-10 shadow-2xl backdrop-blur-sm">
          {/* Inner glow blobs */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/8 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/6 blur-2xl" />

          {/* Days-left pill */}
          {!isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
              className="mb-8 flex justify-center"
            >
              <span className="rounded-full border border-primary/20 bg-primary/8 px-4 py-1 text-xs font-semibold tracking-wide text-primary">
                {totalDaysRemaining} {totalDaysRemaining === 1 ? t("day") : t("days")} · {t("remaining")}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="mb-2 text-center"
          >
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              <BlurText text={title} initialDelay={0.1} delay={0.06} duration={0.45} />
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{formattedDate}</p>
          </motion.div>

          {/* Countdown or Finished */}
          {isFinished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
              className="mt-12 text-center"
            >
              <div
                className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/20 animate-pulse"
                onMouseEnter={() => partyRef.current?.startAnimation()}
              >
                <PartyPopperIcon ref={partyRef} size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                <GradientText>{t("bigDay")}</GradientText>
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("enjoy")}
              </p>
            </motion.div>
          ) : (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {timeUnits.map((unit, i) => (
                <div key={unit.label} className="contents">
                  <TimeUnit value={unit.value} label={unit.label} index={i} />
                  {i < timeUnits.length - 1 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 + 0.04, duration: 0.3 }}
                      className="hidden text-3xl font-light text-muted-foreground sm:block"
                    >
                      :
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {!isFinished && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
              className="mt-12"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
                    className="h-full rounded-full bg-linear-to-r from-primary/70 to-primary"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progressPercent)}% {t("elapsed")}
                </span>
              </div>
            </motion.div>
          )}
        </SpotlightCard>
      </div>

      {/* Footer — hidden in public mode to avoid overlap with the fixed action bar */}
      {!isPublic && (
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="fixed bottom-4 text-xs text-muted-foreground"
      >
        {t("madeWith")}{" "}
        <span className="text-primary">{"<3"}</span>{" "}
        {t("by")}{" "}
        <a
          href="https://github.com/carrijoga"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          carrijoga
        </a>
        {" "}·{" "}v{pkg.version}
      </motion.footer>
      )}
    </div>
  )
}
