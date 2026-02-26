import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
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

export const metadata: Metadata = {
  title: "MyTrip",
  description: "Contagem regressiva para o seu momento especial",
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="mytrip-theme"
        >
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
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}