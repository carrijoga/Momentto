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
import { useLanguage } from "@/lib/language-context"
import { useRef } from "react"
import { sendNotification } from "@/app/actions"

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
      <div className="relative flex size-20 items-center justify-center rounded-2xl bg-card border border-border border-primary font-mono font-bold tabular-nums tracking-tight text-foreground sm:size-28 ">
        <span className="text-3xl sm:text-5xl">
          <NumberFlow value={value} format={{ minimumIntegerDigits: 2 }} />
        </span>
      </div>
      <span className="mt-2.5 text-xs font-medium uppercase tracking-widest text-muted-foreground sm:text-sm">
        {label}
      </span>
    </motion.div>
  )
}

const categoryLabels: Record<string, { pt: string; en: string }> = {
  viagem: { pt: "Viagem", en: "Travel" },
  aniversario: { pt: "Aniversário", en: "Birthday" },
  casamento: { pt: "Casamento", en: "Wedding" },
  formatura: { pt: "Formatura", en: "Graduation" },
  festa: { pt: "Festa", en: "Party" },
  bebe: { pt: "Nascimento", en: "Baby" },
  show: { pt: "Show", en: "Concert" },
  conquista: { pt: "Conquista", en: "Achievement" },
  evento: { pt: "Evento", en: "Event" },
  outro: { pt: "Outro", en: "Other" },
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
  const { language } = useLanguage()
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
          language === "pt" ? "O grande dia chegou!" : "The big day is here!"
        ).catch(console.error)
      }
    }
  }, [date, time, title, language, isPublic])

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
      language === "pt" ? "pt-BR" : "en-US",
      { day: "2-digit", month: "long", year: "numeric" }
    )
    if (!time) return d
    return `${d} ${language === "pt" ? "às" : "at"} ${time}`
  })()

  const catLabel = (categoryLabels[category] ?? categoryLabels.outro)[language]

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
      ? [{ value: timeLeft.months, label: language === "pt" ? (timeLeft.months === 1 ? "Mês" : "Meses") : (timeLeft.months === 1 ? "Month" : "Months") }]
      : []),
    { value: timeLeft.days, label: language === "pt" ? (timeLeft.days === 1 ? "Dia" : "Dias") : (timeLeft.days === 1 ? "Day" : "Days") },
    { value: timeLeft.hours, label: language === "pt" ? (timeLeft.hours === 1 ? "Hora" : "Horas") : (timeLeft.hours === 1 ? "Hour" : "Hours") },
    { value: timeLeft.minutes, label: language === "pt" ? (timeLeft.minutes === 1 ? "Minuto" : "Minutos") : (timeLeft.minutes === 1 ? "Minute" : "Minutes") },
    { value: timeLeft.seconds, label: language === "pt" ? (timeLeft.seconds === 1 ? "Segundo" : "Segundos") : (timeLeft.seconds === 1 ? "Second" : "Seconds") },
  ]

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          <Confetti mode="boom" particleCount={200} />
        </div>
      )}

      <div className="w-full max-w-3xl">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-12 flex items-center justify-between"
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
                  aria-label={language === "pt" ? "Editar" : "Edit"}
                >
                  <Pencil className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{language === "pt" ? "Editar" : "Edit"}</span>
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
                  aria-label={language === "pt" ? "Voltar" : "Back"}
                >
                  <RotateCCWIcon ref={resetRef} size={14} className="shrink-0" />
                  <span className="hidden sm:inline">{language === "pt" ? "Voltar" : "Back"}</span>
                </motion.button>
              </>
            )}
            {isPublic && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {language === "pt" ? "Visualização pública" : "Public view"}
              </span>
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="mb-2 text-center"
        >
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
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
              className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-primary/15"
              onMouseEnter={() => partyRef.current?.startAnimation()}
            >
              <PartyPopperIcon ref={partyRef} size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {language === "pt" ? "O grande dia chegou!" : "The big day is here!"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {language === "pt" ? "Aproveite cada momento." : "Enjoy every moment."}
            </p>
          </motion.div>
        ) : (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
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
            className="mt-14"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {language === "pt" ? "Faltam" : "Remaining"}{" "}
                <span className="font-semibold text-foreground">
                  {totalDaysRemaining}{" "}
                  {language === "pt"
                    ? totalDaysRemaining === 1 ? "dia" : "dias"
                    : totalDaysRemaining === 1 ? "day" : "days"}
                </span>
              </span>
              <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercent)}% {language === "pt" ? "concluído" : "elapsed"}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Public CTA */}
      {isPublic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.4 }}
          className="fixed bottom-16 left-1/2 -translate-x-1/2"
        >
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-90 whitespace-nowrap"
          >
            {language === "pt" ? "Criar a minha contagem" : "Create my own countdown"}
            {" "}
            {"->"}
          </Link>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="fixed bottom-4 text-xs text-muted-foreground"
      >
        {language === "pt" ? "Desenvolvido com" : "Made with"}{" "}
        <span className="text-primary">{"<3"}</span>{" "}
        {language === "pt" ? "por" : "by"}{" "}
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
    </div>
  )
}
