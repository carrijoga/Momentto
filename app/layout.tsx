import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { AccentColorProvider } from "@/lib/accent-color-context"
import { AuthProvider } from "@/lib/auth-context"
import { ActiveCountdownProvider } from "@/lib/active-countdown-context"
import { ConnectivityProvider } from "@/lib/connectivity-context"
import { OfflineBanner } from "@/components/offline-banner"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = "https://mytrip.carrijoga.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyTrip",
    template: "%s | MyTrip",
  },
  description:
    "Contagem regressiva para o seu momento especial. Crie e compartilhe countdowns para viagens, casamentos, formaturas e muito mais.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "MyTrip",
    title: "MyTrip — Contagem regressiva para o seu momento especial",
    description:
      "Crie e compartilhe countdowns para viagens, casamentos, formaturas e muito mais.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MyTrip — Contagem regressiva",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyTrip — Contagem regressiva para o seu momento especial",
    description:
      "Crie e compartilhe countdowns para viagens, casamentos, formaturas e muito mais.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyTrip",
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  description:
    "Contagem regressiva para o seu momento especial. Crie e compartilhe countdowns para viagens, casamentos, formaturas e muito mais.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="mytrip-theme"
        >
          <AccentColorProvider>
          <LanguageProvider>
            <AuthProvider>
              <ConnectivityProvider>
                <ActiveCountdownProvider>
                  <OfflineBanner />
                  {children}
                </ActiveCountdownProvider>
              </ConnectivityProvider>
            </AuthProvider>
          </LanguageProvider>
          </AccentColorProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}