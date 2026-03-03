"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useIsMobile } from "@/hooks/use-mobile"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { CalendarIcon, Clock, Cake, Baby, Music, Trophy, Calendar as CalendarLucide, Star, House } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLanguage } from "@/lib/language-context"
import { AirplaneIcon, type AirplaneIconHandle } from "@/components/ui/airplane"
import { HeartIcon, type HeartIconHandle } from "@/components/ui/heart"
import { GraduationCapIcon, type GraduationCapIconHandle } from "@/components/ui/graduation-cap"
import { PartyPopperIcon, type PartyPopperIconHandle } from "@/components/ui/party-popper"
import { sendGAEvent } from "@/lib/analytics"

interface CountdownData {
  category: string
  title: string
  date: string
  time?: string
  createdAt: string
}

interface CountdownSetupProps {
  onComplete: (data: CountdownData) => void
  onBack?: () => void
  initialCategory?: string
  initialTitle?: string
  initialDate?: string
  initialTime?: string
}

type CategoryIconRef =
  | AirplaneIconHandle
  | HeartIconHandle
  | GraduationCapIconHandle
  | PartyPopperIconHandle
  | null

function getCategoryIcon(
  id: string,
  ref: React.RefObject<CategoryIconRef>,
  size: number,
  isSelected: boolean
) {
  const className = cn(isSelected && "text-primary")
  switch (id) {
    case "viagem":
      return <AirplaneIcon ref={ref as React.RefObject<AirplaneIconHandle>} size={size} className={className} />
    case "casamento":
      return <HeartIcon ref={ref as React.RefObject<HeartIconHandle>} size={size} className={className} />
    case "formatura":
      return <GraduationCapIcon ref={ref as React.RefObject<GraduationCapIconHandle>} size={size} className={className} />
    case "festa":
      return <PartyPopperIcon ref={ref as React.RefObject<PartyPopperIconHandle>} size={size} className={className} />
    case "aniversario":
      return <Cake className={cn("size-6", className)} />
    case "bebe":
      return <Baby className={cn("size-6", className)} />
    case "show":
      return <Music className={cn("size-6", className)} />
    case "conquista":
      return <Trophy className={cn("size-6", className)} />
    case "evento":
      return <CalendarLucide className={cn("size-6", className)} />
    default:
      return <Star className={cn("size-6", className)} />
  }
}

const categoriesPt = [
  { id: "viagem",      label: "Viagem"     },
  { id: "aniversario", label: "Aniversário" },
  { id: "casamento",   label: "Casamento"  },
  { id: "formatura",   label: "Formatura"  },
  { id: "festa",       label: "Festa"      },
  { id: "bebe",        label: "Nascimento" },
  { id: "show",        label: "Show"       },
  { id: "conquista",   label: "Conquista"  },
  { id: "evento",      label: "Evento"     },
  { id: "outro",       label: "Outro"      },
]

const categoriesEn = [
  { id: "viagem",      label: "Travel"      },
  { id: "aniversario", label: "Birthday"    },
  { id: "casamento",   label: "Wedding"     },
  { id: "formatura",   label: "Graduation"  },
  { id: "festa",       label: "Party"       },
  { id: "bebe",        label: "Baby"        },
  { id: "show",        label: "Concert"     },
  { id: "conquista",   label: "Achievement" },
  { id: "evento",      label: "Event"       },
  { id: "outro",       label: "Other"       },
]

const categoryPlaceholders: Record<string, { pt: string; en: string }> = {
  viagem:      { pt: "Ex: Viagem para Paris",          en: "e.g. Trip to Paris"             },
  aniversario: { pt: "Ex: Aniversário da Camila",      en: "e.g. Camila's Birthday"         },
  casamento:   { pt: "Ex: Casamento da Ana e João",    en: "e.g. Ana and João's Wedding"    },
  formatura:   { pt: "Ex: Formatura de Medicina",      en: "e.g. Medical School Graduation" },
  festa:       { pt: "Ex: Festa de Réveillon",         en: "e.g. New Year's Party"          },
  bebe:        { pt: "Ex: Chegada do Bebê",            en: "e.g. Baby's Arrival"            },
  show:        { pt: "Ex: Show do Coldplay",           en: "e.g. Coldplay Concert"          },
  conquista:   { pt: "Ex: Aprovação no concurso",      en: "e.g. Passing the exam"          },
  evento:      { pt: "Ex: Conferência de tecnologia",  en: "e.g. Tech Conference"           },
  outro:       { pt: "Ex: Minha aposentadoria",        en: "e.g. My Retirement"             },
}

const HOURS   = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"))

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
}

export function CountdownSetup({
  onComplete,
  onBack,
  initialCategory,
  initialTitle = "",
  initialDate,
  initialTime,
}: CountdownSetupProps) {
  const { language } = useLanguage()
  const categories = language === "pt" ? categoriesPt : categoriesEn

  const [step, setStep]                       = useState<1 | 2>(initialCategory ? 2 : 1)
  const [direction, setDirection]             = useState(1) // 1 = forward, -1 = backward
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null)
  const [title, setTitle]                     = useState(initialTitle)
  const [date, setDate]                       = useState<Date | undefined>(
    initialDate ? new Date(initialDate + "T00:00:00") : undefined
  )
  const isMobile = useIsMobile()
  const [calendarOpen, setCalendarOpen]       = useState(false)
  const [timeEnabled, setTimeEnabled]         = useState(!!initialTime)
  const [hour, setHour]                       = useState(initialTime ? initialTime.split(":")[0] : "12")
  const [minute, setMinute]                   = useState(initialTime ? initialTime.split(":")[1] : "00")

  const iconRefs = useRef<Record<string, React.RefObject<CategoryIconRef>>>({})
  function getIconRef(id: string): React.RefObject<CategoryIconRef> {
    if (!iconRefs.current[id]) {
      iconRefs.current[id] = { current: null }
    }
    return iconRefs.current[id]
  }

  const selectedCat = categories.find((c) => c.id === selectedCategory)

  const handleSubmit = () => {
    if (selectedCategory && title.trim() && date) {
      const dateStr = format(date, "yyyy-MM-dd")
      sendGAEvent("countdown_created", { countdown_category: selectedCategory })
      onComplete({
        category: selectedCategory,
        title:    title.trim(),
        date:     dateStr,
        time:     timeEnabled ? `${hour}:${minute}` : undefined,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const placeholder = selectedCategory
    ? (categoryPlaceholders[selectedCategory]?.[language] ?? (language === "pt" ? "Ex: Meu evento" : "e.g. My event"))
    : language === "pt" ? "Ex: Meu evento especial" : "e.g. My special event"

  const labels = {
    title:     language === "pt" ? "Contagem Regressiva"                   : "Countdown",
    home:      language === "pt" ? "Início"                                : "Home",
    step1Sub:  language === "pt" ? "Escolha o motivo da sua contagem"      : "Choose the reason for your countdown",
    step2Sub:  language === "pt" ? "Diga mais sobre esse momento especial" : "Tell us more about this special moment",
    eventName: language === "pt" ? "Qual o nome do evento?"                : "What is the event name?",
    when:      language === "pt" ? "Quando vai acontecer?"                 : "When is it happening?",
    pickDate:  language === "pt" ? "Selecione uma data"                    : "Select a date",
    addTime:   language === "pt" ? "Adicionar horário (opcional)"          : "Add time (optional)",
    at:        language === "pt" ? "Horário"                               : "Time",
    continue:  language === "pt" ? "Continuar"                             : "Continue",
    back:      language === "pt" ? "Voltar"                                : "Back",
    start:     language === "pt" ? "Iniciar Contagem"                       : "Start Countdown",
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back to home button */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onBack}
            className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <House className="size-4" />
            <span>{labels.home}</span>
          </motion.button>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
            {labels.title}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 ? labels.step1Sub : labels.step2Sub}
          </p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-8 flex items-center justify-center gap-2"
        >
          <motion.div
            layout
            className="h-1.5 w-12 rounded-full bg-primary"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <motion.div
            layout
            className={cn(
              "h-1.5 w-12 rounded-full",
              step === 2 ? "bg-primary" : "bg-secondary"
            )}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </motion.div>

        {/* Step content with AnimatePresence */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {categories.map((cat, i) => {
                  const isSelected = selectedCategory === cat.id
                  const iconRef = getIconRef(cat.id)
                  return (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.9, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        delay: i * 0.03,
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        const ref = iconRef.current as AirplaneIconHandle | null
                        ref?.startAnimation?.()
                        setDirection(1)
                        setTimeout(() => setStep(2), 150)
                      }}
                      onMouseEnter={() => {
                        const ref = iconRef.current as AirplaneIconHandle | null
                        ref?.startAnimation?.()
                      }}
                      onMouseLeave={() => {
                        const ref = iconRef.current as AirplaneIconHandle | null
                        ref?.stopAnimation?.()
                      }}
                      className={cn(
                        "group flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      {getCategoryIcon(cat.id, iconRef, 24, isSelected)}
                      <span className="text-xs font-medium">{cat.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              {/* Selected category badge */}
              <div className="mb-6 flex items-center justify-center">
                {selectedCat && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex items-center gap-3 rounded-full bg-primary/10 px-5 py-2 text-primary"
                  >
                    {getCategoryIcon(selectedCat.id, getIconRef(selectedCat.id), 20, true)}
                    <span className="text-sm font-medium">{selectedCat.label}</span>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {/* Title input */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30, delay: 0.05 }}
                >
                  <label htmlFor="event-title" className="mb-2 block text-sm font-medium text-foreground">
                    {labels.eventName} *
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    placeholder={placeholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                </motion.div>

                {/* Date picker */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30, delay: 0.1 }}
                >
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {labels.when} *
                  </label>
                  {isMobile ? (
                    <div className="relative">
                      <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="date"
                        min={format(today, "yyyy-MM-dd")}
                        value={date ? format(date, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            setDate(new Date(e.target.value + "T00:00:00"))
                          } else {
                            setDate(undefined)
                          }
                        }}
                        className={cn(
                          "w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm transition-colors",
                          "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                          date ? "text-foreground" : "text-muted-foreground"
                        )}
                      />
                    </div>
                  ) : (
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-left",
                            "flex items-center gap-2 transition-colors",
                            date ? "text-foreground" : "text-muted-foreground",
                            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                            "hover:border-primary/50"
                          )}
                        >
                          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                          {date ? format(date, "dd/MM/yyyy") : labels.pickDate}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        side="bottom"
                        avoidCollisions={false}
                        sideOffset={4}
                      >
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d)
                            setCalendarOpen(false)
                          }}
                          disabled={(d) => d < today}
                          locale={language === "pt" ? ptBR : enUS}
                          fixedWeeks
                          initialFocus
                          className="[--cell-size:--spacing(7)] p-2 text-sm"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </motion.div>

                {/* Optional time picker */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30, delay: 0.15 }}
                >
                  <button
                    type="button"
                    onClick={() => setTimeEnabled((v) => !v)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all duration-150",
                      timeEnabled
                        ? "border-primary/60 bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <Clock className="size-4 shrink-0" />
                    <span>{labels.addTime}</span>
                    <span className="ml-auto text-xs opacity-60">{timeEnabled ? "+" : "+"}</span>
                  </button>

                  <AnimatePresence>
                    {timeEnabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs text-muted-foreground shrink-0 w-14">{labels.at}:</label>
                          <select
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {HOURS.map((h) => <option key={h} value={h}>{h}h</option>)}
                          </select>
                          <span className="text-muted-foreground font-bold">:</span>
                          <select
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {MINUTES.map((m) => <option key={m} value={m}>{m}min</option>)}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30, delay: 0.2 }}
                className="mt-8 flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setDirection(-1); setStep(1) }}
                  className="flex-1 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  {labels.back}
                </motion.button>
                <motion.button
                  whileHover={title.trim() && date ? { scale: 1.02 } : undefined}
                  whileTap={title.trim() && date ? { scale: 0.98 } : undefined}
                  onClick={handleSubmit}
                  disabled={!title.trim() || !date}
                  className={cn(
                    "flex-[2] rounded-xl py-3.5 text-sm font-semibold transition-all",
                    title.trim() && date
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "cursor-not-allowed bg-secondary text-muted-foreground"
                  )}
                >
                  {labels.start}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
