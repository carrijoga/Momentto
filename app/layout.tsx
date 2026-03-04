import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AccentColorProvider } from "@/lib/accent-color-context"
import { AuthProvider } from "@/lib/auth-context"
import { ActiveCountdownProvider } from "@/lib/active-countdown-context"
import { ConnectivityProvider } from "@/lib/connectivity-context"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = "https://momentto.carrijoga.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Momentto",
    template: "%s | Momentto",
  },
  description:
    "Contagem regressiva para o seu momento especial. Crie e compartilhe countdowns para viagens, casamentos, formaturas e muito mais.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "Momentto",
    title: "Momentto — Contagem regressiva para o seu momento especial",
    description:
      "Crie e compartilhe countdowns para viagens, casamentos, formaturas e muito mais.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Momentto — Contagem regressiva",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentto — Contagem regressiva para o seu momento especial",
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
  name: "Momentto",
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
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=localStorage.getItem('mytrip-theme');if(v&&!localStorage.getItem('momentto-theme')){localStorage.setItem('momentto-theme',v);localStorage.removeItem('mytrip-theme');}}catch(e){}})()`
          }}
        />
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
          storageKey="momentto-theme"
        >
          <AccentColorProvider>
            <AuthProvider>
              <ConnectivityProvider>
                <ActiveCountdownProvider>
                  {children}
                </ActiveCountdownProvider>
              </ConnectivityProvider>
            </AuthProvider>
          </AccentColorProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}