import type React from "react"
import type { Metadata, Viewport } from "next"
import { OfflineBanner } from "@/components/offline-banner"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { locales, type Locale } from "@/i18n/request"
import { notFound } from "next/navigation"

const SITE_URL = "https://momentto.carrijoga.com.br"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Momentto",
      template: "%s | Momentto",
    },
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Momentto",
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: t("ogAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <OfflineBanner />
      {children}
    </NextIntlClientProvider>
  )
}