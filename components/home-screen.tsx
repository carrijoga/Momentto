"use client"

import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { AirplaneIcon, type AirplaneIconHandle } from "@/components/ui/airplane"
import { HeartIcon, type HeartIconHandle } from "@/components/ui/heart"
import { GraduationCapIcon, type GraduationCapIconHandle } from "@/components/ui/graduation-cap"
import { PartyPopperIcon, type PartyPopperIconHandle } from "@/components/ui/party-popper"

const floatingIcons = [
  { id: "viagem", Component: AirplaneIcon, position: "top-[18%] left-[12%]", delay: "0s" },
  { id: "casamento", Component: HeartIcon, position: "top-[14%] right-[14%]", delay: "1.5s" },
  { id: "formatura", Component: GraduationCapIcon, position: "bottom-[22%] left-[10%]", delay: "3s" },
  { id: "festa", Component: PartyPopperIcon, position: "bottom-[18%] right-[12%]", delay: "0.8s" },
] as const

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { language } = useLanguage()
  const airplaneRef = useRef<AirplaneIconHandle>(null)

  const labels = {
    tagline:
      language === "pt"
        ? "Cada momento especial merece uma contagem regressiva."
        : "Every special moment deserves a countdown.",
    cta: language === "pt" ? "Criar contagem" : "Create countdown",
    footer:
      language === "pt"
        ? "Viagens, festas, conquistas e muito mais"
        : "Trips, parties, achievements and much more",
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6">
      {/* Floating background icons */}
      {floatingIcons.map(({ id, Component, position, delay }) => (
        <div
          key={id}
          className={`absolute ${position} hidden opacity-[0.06] sm:block`}
          style={{ animation: `float 6s ease-in-out infinite`, animationDelay: delay }}
        >
          <Component size={48} />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* App icon / logo area */}
        <div
          className="mb-8 flex size-20 items-center justify-center rounded-3xl bg-primary/10 animate-in fade-in zoom-in-50 duration-500"
          onMouseEnter={() => airplaneRef.current?.startAnimation()}
          onMouseLeave={() => airplaneRef.current?.stopAnimation()}
        >
          <AirplaneIcon ref={airplaneRef} size={36} className="text-primary" />
        </div>

        {/* App name */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 sm:text-6xl">
          MyTrip
        </h1>

        {/* Tagline */}
        <p className="mb-10 max-w-xs text-pretty leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {labels.tagline}
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.97] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
        >
          {labels.cta}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>

        {/* Subtle footer text */}
        <p className="mt-12 text-xs tracking-wide text-muted-foreground/60 animate-in fade-in duration-700 delay-500">
          {labels.footer}
        </p>
      </div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
