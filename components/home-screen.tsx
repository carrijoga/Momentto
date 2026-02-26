"use client"

import { useRef } from "react"
import type { ElementType } from "react"
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

// All available animation names (keyframes defined below)
const ANIMATIONS = ["floatY", "slideLR", "slideTB", "driftDiag1", "driftDiag2", "spinFloat"] as const
type AnimName = typeof ANIMATIONS[number]

// Picked once per page load — all icons share the same motion type this session
const SESSION_ANIM: AnimName = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)]

interface ScatteredIcon {
  Icon: ElementType
  top?: string
  bottom?: string
  left?: string
  right?: string
  size: number
  opacity: number
  duration: string
  delay: string
}

// Icons spread closer to center with bigger sizes
const scattered: ScatteredIcon[] = [
  // Top row — spread horizontally above center
  { Icon: Star,          top: "8%",    left: "12%",  size: 30, opacity: 0.10, duration: "7s",  delay: "0s"   },
  { Icon: Sparkles,      top: "5%",    left: "35%",  size: 26, opacity: 0.09, duration: "9s",  delay: "0.6s" },
  { Icon: Sun,           top: "5%",    right: "35%", size: 26, opacity: 0.08, duration: "8s",  delay: "1.4s" },
  { Icon: Rocket,        top: "8%",    right: "12%", size: 30, opacity: 0.10, duration: "10s", delay: "0.3s" },
  // Upper-mid sides
  { Icon: Plane,         top: "22%",   left: "6%",   size: 32, opacity: 0.10, duration: "8s",  delay: "2.0s" },
  { Icon: Heart,         top: "18%",   left: "20%",  size: 28, opacity: 0.09, duration: "11s", delay: "1.0s" },
  { Icon: GraduationCap, top: "18%",   right: "20%", size: 28, opacity: 0.09, duration: "9s",  delay: "3.0s" },
  { Icon: Music,         top: "22%",   right: "6%",  size: 32, opacity: 0.10, duration: "7s",  delay: "1.8s" },
  // Center-side belt
  { Icon: Flame,         top: "42%",   left: "5%",   size: 30, opacity: 0.09, duration: "10s", delay: "0.5s" },
  { Icon: Compass,       top: "38%",   left: "18%",  size: 26, opacity: 0.08, duration: "12s", delay: "4.0s" },
  { Icon: Zap,           top: "42%",   right: "5%",  size: 30, opacity: 0.09, duration: "9s",  delay: "2.5s" },
  { Icon: Camera,        top: "38%",   right: "18%", size: 26, opacity: 0.08, duration: "8s",  delay: "1.2s" },
  // Lower-mid sides
  { Icon: Gift,          bottom: "22%",left: "6%",   size: 32, opacity: 0.10, duration: "11s", delay: "3.5s" },
  { Icon: Umbrella,      bottom: "18%",left: "20%",  size: 28, opacity: 0.09, duration: "8s",  delay: "0.8s" },
  { Icon: MapPin,        bottom: "18%",right: "20%", size: 28, opacity: 0.09, duration: "10s", delay: "2.2s" },
  { Icon: Trophy,        bottom: "22%",right: "6%",  size: 32, opacity: 0.10, duration: "7s",  delay: "1.6s" },
  // Bottom row
  { Icon: Clock,         bottom: "8%", left: "12%",  size: 30, opacity: 0.10, duration: "9s",  delay: "4.5s" },
  { Icon: Calendar,      bottom: "5%", left: "35%",  size: 26, opacity: 0.08, duration: "11s", delay: "0.4s" },
  { Icon: Cake,          bottom: "5%", right: "35%", size: 26, opacity: 0.08, duration: "8s",  delay: "3.2s" },
  { Icon: PartyPopper,   bottom: "8%", right: "12%", size: 30, opacity: 0.10, duration: "10s", delay: "1.5s" },
  // Near-center extras
  { Icon: Smile,         top: "30%",   left: "32%",  size: 22, opacity: 0.07, duration: "13s", delay: "5.0s" },
  { Icon: Star,          top: "62%",   right: "32%", size: 22, opacity: 0.07, duration: "9s",  delay: "2.8s" },
]

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { language } = useLanguage()
  const airplaneRef = useRef<AirplaneIconHandle>(null)

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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6">
      {/* Scattered background icons — all share SESSION_ANIM, varied timing */}
      {scattered.map(({ Icon, top, left, right, bottom, size, opacity, duration, delay }, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top,
            left,
            right,
            bottom,
            opacity,
            animation: `${SESSION_ANIM} ${duration} ease-in-out infinite`,
            animationDelay: delay,
          }}
        >
          <Icon size={size} />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* App icon / logo area */}
        <div
          className="mb-8 flex size-24 items-center justify-center rounded-[28px] bg-primary/10 ring-1 ring-primary/20 shadow-xl shadow-primary/10 animate-in fade-in zoom-in-50 duration-500"
          onMouseEnter={() => airplaneRef.current?.startAnimation()}
          onMouseLeave={() => airplaneRef.current?.stopAnimation()}
        >
          <AirplaneIcon ref={airplaneRef} size={40} className="text-primary" />
        </div>

        {/* App name */}
        <h1 className="mb-3 text-5xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 sm:text-6xl">
          MyTrip
        </h1>

        {/* Tagline */}
        <p className="mb-3 max-w-xs text-pretty text-lg font-medium leading-snug text-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          {labels.tagline}
        </p>

        {/* Sub-tagline */}
        <p className="mb-10 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {labels.sub}
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:opacity-90 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.97] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
        >
          {labels.cta}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {/* Subtle footer text */}
        <p className="mt-10 text-xs tracking-wide text-muted-foreground/50 animate-in fade-in duration-700 delay-500">
          {labels.footer}
        </p>
      </div>

      {/* Animation keyframes — SESSION_ANIM selects one of these at random per load */}
      <style jsx>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-18px); }
        }
        @keyframes slideLR {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(22px); }
        }
        @keyframes slideTB {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(22px); }
        }
        @keyframes driftDiag1 {
          0%, 100% { transform: translate(0px, 0px); }
          33%       { transform: translate(16px, -14px); }
          66%       { transform: translate(-10px, 12px); }
        }
        @keyframes driftDiag2 {
          0%, 100% { transform: translate(0px, 0px); }
          33%       { transform: translate(-14px, 16px); }
          66%       { transform: translate(12px, -10px); }
        }
        @keyframes spinFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%       { transform: translateY(-10px) rotate(90deg); }
          50%       { transform: translateY(-20px) rotate(180deg); }
          75%       { transform: translateY(-10px) rotate(270deg); }
        }
      `}</style>
    </div>
  )
}
