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

export default async function Image({
  params,
}: {
  params: Promise<{ shareId: string; locale: string }>
}) {
  const { shareId, locale } = await params
  const t = await getTranslations({ locale, namespace: "share" })
  const tCountdown = await getTranslations({ locale, namespace: "countdown" })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("countdowns")
    .select("title, category, date, expires_at")
    .eq("share_id", shareId)
    .single()

  const title = data?.title ?? t("fallbackTitle")
  const emoji = CATEGORY_EMOJI[data?.category ?? "default"] ?? CATEGORY_EMOJI.default
  const days = data?.date ? daysUntil(data.date) : null
  const isExpired = data?.expires_at && new Date(data.expires_at) < new Date()
  const daysWord = days === 1 ? tCountdown("day") : tCountdown("days")

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0d0d1f 0%, #1a1a2e 55%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 65%)",
          }}
        />
        {/* Glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -80,
            width: 580,
            height: 580,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "56px 80px",
            justifyContent: "space-between",
          }}
        >
          {/* Top: branding */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "7px 20px",
                borderRadius: 999,
                background: "rgba(99,102,241,0.14)",
                border: "1px solid rgba(99,102,241,0.32)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 22,
                letterSpacing: "0.04em",
              }}
            >
              Momentto
            </div>
          </div>

          {/* Middle: emoji + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 76, lineHeight: 1 }}>{emoji}</div>
            <div
              style={{
                fontSize: 68,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                maxWidth: 840,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom: days counter pill */}
          {!isExpired && days !== null ? (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  padding: "18px 32px",
                  borderRadius: 18,
                  background: "rgba(99,102,241,0.14)",
                  border: "1px solid rgba(99,102,241,0.28)",
                }}
              >
                <span
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    color: "#818cf8",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {days}
                </span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {daysWord}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
