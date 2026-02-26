"use client"

import { CountdownDisplay } from "@/components/countdown-display"
import type { CountdownEntry } from "@/lib/types"

interface PublicCountdownWrapperProps {
  entry: CountdownEntry
}

export function PublicCountdownWrapper({ entry }: PublicCountdownWrapperProps) {
  return (
    <CountdownDisplay
      entry={entry}
      isPublic={true}
      onEdit={() => {}}
      onReset={() => {}}
      onShareGenerated={() => {}}
    />
  )
}
