import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
  // Create an unmodified response that we can mutate cookies on
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Instantiate a server client in middleware to refresh session cookies if needed
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Touch auth to ensure refresh logic runs; ignore result
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Exclude Next.js internals and static files
    "/((?!_next|_vercel|static|.*\\..*).*)",
  ],
}
