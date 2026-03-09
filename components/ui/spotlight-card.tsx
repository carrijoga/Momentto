"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "color-mix(in oklch, var(--primary) 14%, transparent)",
  ...props
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={(e) => {
        setPosition(null)
        props.onPointerLeave?.(e)
      }}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: position
            ? `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`
            : "none",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
