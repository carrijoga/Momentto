"use client"

import NumberFlow from "@number-flow/react"

interface MetricCardProps {
  label: string
  value: number
  description?: string
}

export function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white tabular-nums">
        <NumberFlow value={value} />
      </p>
      {description && (
        <p className="text-xs text-zinc-600">{description}</p>
      )}
    </div>
  )
}
