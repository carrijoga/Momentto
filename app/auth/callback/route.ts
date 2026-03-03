import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { migrateAnonymousCountdowns } from "@/app/actions"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  // anon_uid is forwarded by login/page.tsx when an anonymous user signs in.
  // Doing migration here (server-side) guarantees it runs regardless of which
  // browser or device the user opens the magic link / OAuth redirect in.
  const anonUid = searchParams.get("anon_uid")

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    // After a successful sign-in, migrate any anonymous data to the new account.
    // Only runs when the user was anonymous before signing in.
    if (anonUid) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id !== anonUid) {
        await migrateAnonymousCountdowns(anonUid, user.id).catch(console.error)
      }
    }
  }

  return NextResponse.redirect(origin)
}
