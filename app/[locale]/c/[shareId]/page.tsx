import { cache } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server"
import { PublicCountdownWrapper } from "@/components/public-countdown-wrapper"
import { SaveCountdownButton } from "@/components/save-countdown-button"
import { CreateCopyButton } from "@/components/create-copy-button"
import type { CountdownEntry } from "@/lib/types"
import { getTranslations } from "next-intl/server"

interface Props {
  params: Promise<{ shareId: string; locale: string }>
}

const getCountdown = cache(async (shareId: string): Promise<CountdownEntry | null> => {
  const supabase = getSupabaseServiceClient()
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

  // expires_at = null means "never expires"; only block if explicitly expired
  if (entry.expires_at != null && new Date(entry.expires_at) < new Date()) return null

  return entry
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId, locale } = await params
  const entry = await getCountdown(shareId)
  const t = await getTranslations({ locale, namespace: "share" })

  const title = entry ? entry.title : t("fallbackTitle")
  const description = entry
    ? t("countdownFor", { title: entry.title })
    : t("fallbackDescription")

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${title} | Momentto`,
      description,
      images: [{ url: `/${locale}/c/${shareId}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Momentto`,
      description,
      images: [`/${locale}/c/${shareId}/opengraph-image`],
    },
  }
}

export default async function SharedCountdownPage({ params }: Props) {
  const { shareId, locale } = await params
  const entry = await getCountdown(shareId)
  const t = await getTranslations({ locale, namespace: "share" })

  if (!entry) {
    return (
      <ExpiredScreen
        fallbackTitle={t("fallbackTitle")}
        fallbackDescription={t("fallbackDescription")}
        createCta={t("generate")}
      />
    )
  }

  // Check if the authenticated user has already saved this countdown
  let isSaved = false
  let savedId: string | null = null
  let isAuthenticated = false

  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      isAuthenticated = true
      const { data: savedRow } = await supabase
        .from("saved_countdowns")
        .select("id")
        .eq("share_id", shareId)
        .single()
      if (savedRow) {
        isSaved = true
        savedId = savedRow.id
      }
    }
  } catch {
    // Not authenticated or error — proceed without save state
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">
        <PublicCountdownWrapper entry={entry} />
      </div>
      <div className="sticky bottom-0 z-40 flex items-center justify-center gap-3 px-4 py-4 border-t border-border/40 bg-background/80 backdrop-blur-md">
        <CreateCopyButton
          title={entry.title}
          date={entry.date}
          category={entry.category}
          locale={locale}
          isAuthenticated={isAuthenticated}
        />
        {isAuthenticated && (
          <SaveCountdownButton
            shareId={shareId}
            savedId={savedId}
            isSaved={isSaved}
            resolvedData={{
              title: entry.title,
              date: entry.date,
              category: entry.category,
              expires_at: entry.expires_at,
            }}
          />
        )}
      </div>
    </div>
  )
}

function ExpiredScreen({
  fallbackTitle,
  fallbackDescription,
  createCta,
}: {
  fallbackTitle: string
  fallbackDescription: string
  createCta: string
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-4xl">
        🔗
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">{fallbackTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{fallbackDescription}</p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-90"
      >
        {createCta}
      </Link>
    </div>
  )
}

