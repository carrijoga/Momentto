import { ImageResponse } from "next/og"
import { createClient } from "@supabase/supabase-js"
import { getTranslations } from "next-intl/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const CATEGORY_EMOJI: Record<string, string> = {
  travel: "✈️",
  wedding: "💍",
  graduation: "🎓",
  party: "🎉",
  birthday: "🎂",
  concert: "🎵",
  sports: "🏆",
  viagem: "✈️",
  casamento: "💍",
  formatura: "🎓",
  festa: "🎉",
  aniversario: "🎂",
  show: "🎵",
  conquista: "🏆",
  bebe: "👶",
  evento: "📅",
  default: "⏳",
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export async function generateImageMetadata() {
  return [{ id: "og", alt: "Momentto countdown" }]
}

export default async function Image({
  params,
}: {
  params: { shareId: string; locale: string }
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "share" })
  const tCountdown = await getTranslations({ locale: params.locale, namespace: "countdown" })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("countdowns")
    .select("title, category, date, expires_at")
    .eq("share_id", params.shareId)
    .single()

  const title = data?.title ?? t("fallbackTitle")
  const emoji = CATEGORY_EMOJI[data?.category ?? "default"] ?? CATEGORY_EMOJI.default
  const days = data?.date ? daysUntil(data.date) : null
  const isExpired = data?.expires_at && new Date(data.expires_at) < new Date()

  const daysLabel = days === 1
    ? `1 ${tCountdown("day").toLowerCase()}`
    : `${days} ${tCountdown("days").toLowerCase()}`

  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a2e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "60px",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 18,
            marginBottom: 32,
          }}
        >
          Momentto
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 80, marginBottom: 24 }}>{emoji}</div>

        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
            marginBottom: 28,
          }}
        >
          {title}
        </div>

        {/* Days remaining */}
        {!isExpired && days !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <span style={{ fontSize: 64, fontWeight: 700, color: "#818cf8" }}>
              {days}
            </span>
            <span style={{ fontSize: 28 }}>
              {daysLabel}
            </span>
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
