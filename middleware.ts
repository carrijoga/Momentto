import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/i18n/request"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes that must stay outside [locale] — never apply locale prefix
  if (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next()
  }

  // Migrate legacy momentto-language cookie → NEXT_LOCALE so next-intl picks it up
  const legacyLang = request.cookies.get("momentto-language")?.value
  if (legacyLang && !request.cookies.get("NEXT_LOCALE")) {
    const mapped = legacyLang === "pt" ? "pt-BR" : legacyLang
    if ((locales as readonly string[]).includes(mapped)) {
      const response = intlMiddleware(request)
      response.cookies.set("NEXT_LOCALE", mapped, { path: "/", maxAge: 60 * 60 * 24 * 365 })
      response.cookies.delete("momentto-language")
      return withSupabase(request, response)
    }
  }

  // Redirect legacy share links without locale prefix (e.g. /c/xpto → /en/c/xpto)
  if (pathname.startsWith("/c/") && !isLocalePrefixed(pathname)) {
    const locale = getPreferredLocale(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(url)
  }

  const intlResponse = intlMiddleware(request)
  return withSupabase(request, intlResponse)
}

function isLocalePrefixed(pathname: string): boolean {
  return locales.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)
}

function getPreferredLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie
  const acceptLanguage = request.headers.get("accept-language") ?? ""
  for (const locale of locales) {
    if (acceptLanguage.toLowerCase().includes(locale.toLowerCase())) return locale
  }
  return defaultLocale
}

async function withSupabase(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  let supabaseResponse = response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for Server Actions to see the session
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.*|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
