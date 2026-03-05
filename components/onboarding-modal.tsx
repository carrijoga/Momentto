"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Calendar, Clock, Share2, Bell, Smartphone, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

const STEPS = ["create", "view", "share", "notify", "install"] as const
type Step = (typeof STEPS)[number]

const STEP_ICONS: Record<Step, React.ElementType> = {
  create: Calendar,
  view: Clock,
  share: Share2,
  notify: Bell,
  install: Smartphone,
}

interface OnboardingModalProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const t = useTranslations("onboarding")
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const total = STEPS.length
  const currentStep = STEPS[stepIndex]
  const isLast = stepIndex === total - 1
  const Icon = STEP_ICONS[currentStep]

  function finish() {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding-completed", "1")
    }
    onComplete()
  }

  function next() {
    if (isLast) {
      finish()
    } else {
      setDirection(1)
      setStepIndex((i) => i + 1)
    }
  }

  function skip() {
    finish()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-t-3xl bg-background pb-safe shadow-2xl sm:rounded-3xl"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <div className="px-6 pt-8 pb-6">
          {/* Step counter */}
          <p className="mb-6 text-center text-xs font-medium text-muted-foreground">
            {t("stepCount", { current: stepIndex + 1, total })}
          </p>

          {/* Slide content */}
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon */}
              <motion.div
                className="mb-6 flex size-20 items-center justify-center rounded-[24px] bg-primary/10 ring-1 ring-primary/20 shadow-lg shadow-primary/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
              >
                <Icon size={36} className="text-primary" />
              </motion.div>

              {/* Text */}
              <h2 className="mb-3 text-xl font-bold text-foreground">
                {t(`steps.${currentStep}.title`)}
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t(`steps.${currentStep}.description`)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="mt-8 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full bg-muted-foreground/30"
                animate={{
                  width: i === stepIndex ? 20 : 6,
                  backgroundColor:
                    i === stepIndex
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.3)",
                }}
                style={{ height: 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            ))}
          </div>

          {/* Footer buttons */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {!isLast ? (
              <button
                onClick={skip}
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {t("skip")}
              </button>
            ) : (
              <div />
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20"
            >
              {isLast ? t("start") : t("next")}
              {!isLast && (
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
