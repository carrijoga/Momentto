"use client"

import { useRef, useMemo } from "react"
import type { ElementType } from "react"
import { motion } from "motion/react"
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
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { AirplaneIcon, type AirplaneIconHandle } from "@/components/ui/airplane"

// Motion types for background icons
type MotionType = "floatY" | "slideLR" | "slideTB" | "driftDiag1" | "driftDiag2"

const MOTION_TYPES: MotionType[] = ["floatY", "slideLR", "slideTB", "driftDiag1", "driftDiag2"]

function getMotionAnimation(type: MotionType) {
  switch (type) {
    case "floatY":
      return { y: [0, -18, 0] }
    case "slideLR":
      return { x: [0, 22, 0] }
    case "slideTB":
      return { y: [0, 22, 0] }
    case "driftDiag1":
      return { x: [0, 16, -10, 0], y: [0, -14, 12, 0] }
    case "driftDiag2":
      return { x: [0, -14, 12, 0], y: [0, 16, -10, 0] }
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

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { language } = useLanguage()
  const airplaneRef = useRef<AirplaneIconHandle>(null)

  // Pick a random motion type once per mount
  const sessionMotion = useMemo<MotionType>(
    () => MOTION_TYPES[Math.floor(Math.random() * MOTION_TYPES.length)],
    []
  )

  const labels = {
    tagline:
      language === "pt"
        ? "Cada momento especial merece ser aguardado com emoção."
        : "Every special moment deserves to be eagerly awaited.",
    sub:
      language === "pt"
        ? "Crie sua contagem regressiva e sinta a antecipação crescer a cada segundo."
        : "Create your countdown and feel the anticipation build with every second.",
    cta: language === "pt" ? "Criar minha contagem" : "Create my countdown",
    footer:
      language === "pt"
        ? "Viagens · Casamentos · Formaturas · Festas · e muito mais"
        : "Trips · Weddings · Graduations · Parties · and much more",
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6">
      {/* Scattered background icons — all use motion.div infinite */}
      {scattered.map(({ Icon, top, left, right, bottom, size, opacity, duration, delay }, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top, left, right, bottom, opacity }}
          animate={getMotionAnimation(sessionMotion)}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration,
            delay,
            ease: "easeInOut",
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* App icon / logo area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-8 flex size-24 items-center justify-center rounded-[28px] bg-primary/10 ring-1 ring-primary/20 shadow-xl shadow-primary/10"
          onMouseEnter={() => airplaneRef.current?.startAnimation()}
          onMouseLeave={() => airplaneRef.current?.stopAnimation()}
        >
          <AirplaneIcon ref={airplaneRef} size={40} className="text-primary" />
        </motion.div>

        {/* App name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="mb-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
        >
          Momentto
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
          className="mb-3 max-w-xs text-pretty text-lg font-medium leading-snug text-foreground/80"
        >
          {labels.tagline}
        </motion.p>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
          className="mb-10 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground"
        >
          {labels.sub}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="group flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
        >
          {labels.cta}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.button>

        {/* Subtle footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 text-xs tracking-wide text-muted-foreground/50"
        >
          {labels.footer}
        </motion.p>
      </div>
    </main>
  )
}
