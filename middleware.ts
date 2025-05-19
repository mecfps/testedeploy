import { createMiddlewareClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Ignorar rotas públicas e arquivos estáticos
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/static") ||
    req.nextUrl.pathname.includes(".") ||
    req.nextUrl.pathname === "/debug" ||
    req.nextUrl.pathname === "/api/debug"
  ) {
    return NextResponse.next()
  }

  // Ignorar rotas de autenticação
  if (req.nextUrl.pathname === "/auth/callback" || req.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAccessingProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")
  const isAccessingLoginPage = req.nextUrl.pathname === "/"

  if (!session && isAccessingProtectedRoute) {
    console.log("Middleware SSR: Usuário não autenticado, redirecionando para login")
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (session && isAccessingLoginPage) {
    console.log("Middleware SSR: Usuário já autenticado, redirecionando para dashboard")
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|images|.*\\..*$).*)",
  ],
}
