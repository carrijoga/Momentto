import { cache } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { getSupabaseServiceClient } from "@/lib/supabase/server"
import { PublicCountdownWrapper } from "@/components/public-countdown-wrapper"
import type { CountdownEntry } from "@/lib/types"

interface Props {
  params: Promise<{ shareId: string }>
}

// Cached fetcher — called by both generateMetadata and the page component,
// resulting in a single DB round-trip per request.
const getCountdown = cache(async (shareId: string): Promise<CountdownEntry | null> => {
  const supabase = await getSupabaseServiceClient()
  const { data, error } = await supabase
    .from("countdowns")
    .select("id, share_id, category, title, date, time, created_at, expires_at")
    .eq("share_id", shareId)
    .single()

  if (error || !data) return null

  const entry: CountdownEntry = {
    id: data.id,
    share_id: data.share_id,
    category: data.category,
    title: data.title,
    date: data.date,
    time: data.time ?? null,
    created_at: data.created_at,
    expires_at: data.expires_at ?? null,
  }

  if (entry.expires_at && new Date(entry.expires_at) < new Date()) return null

  return entry
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params
  const entry = await getCountdown(shareId)

  const title = entry ? entry.title : "Contagem regressiva"
  const description = entry
    ? `Acompanhe a contagem regressiva para: ${entry.title}`
    : "Este link de compartilhamento não existe ou já expirou."

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${title} | Momentto`,
      description,
      images: [{ url: `/c/${shareId}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Momentto`,
      description,
      images: [`/c/${shareId}/opengraph-image`],
    },
  }
}

export default async function SharedCountdownPage({ params }: Props) {
  const { shareId } = await params
  const entry = await getCountdown(shareId)

  if (!entry) {
    return <ExpiredScreen />
  }

  return <PublicCountdownWrapper entry={entry} />
}

function ExpiredScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-4xl">
        🔗
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Link expirado ou inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link de compartilhamento não existe ou já expirou.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-90"
      >
        Criar minha contagem
      </Link>
    </div>
  )
}
