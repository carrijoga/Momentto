import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { locales, defaultLocale } from "@/i18n/request"

interface Props {
  params: Promise<{ shareId: string }>
}

function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale
  const preferred = acceptLanguage
    .split(",")
    .map((s) => s.split(";")[0].trim())
  for (const lang of preferred) {
    // Exact match
    if (locales.includes(lang as typeof locales[number])) return lang
    // Prefix match (e.g. "pt" -> "pt-BR")
    const prefix = lang.split("-")[0]
    const match = locales.find((l) => l.startsWith(prefix))
    if (match) return match
  }
  return defaultLocale
}

export default async function LegacySharedCountdownRedirect({ params }: Props) {
  const { shareId } = await params
  const headersList = await headers()
  const acceptLanguage = headersList.get("accept-language")
  const locale = detectLocale(acceptLanguage)
  redirect(`/${locale}/c/${shareId}`)
}

