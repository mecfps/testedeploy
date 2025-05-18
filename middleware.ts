import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Não aplicar middleware a recursos estáticos
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

  // Verificar se é uma rota de autenticação
  if (req.nextUrl.pathname === "/auth/callback" || req.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  // Criar uma resposta que podemos modificar
  const res = NextResponse.next()

  // Criar cliente Supabase para o middleware
  const supabase = createMiddlewareClient({ req, res })

  // Obter a sessão atual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Verificar se o usuário está tentando acessar uma rota protegida
  const isAccessingProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

  // Verificar se o usuário está tentando acessar a página de login
  const isAccessingLoginPage = req.nextUrl.pathname === "/"

  // Se não estiver autenticado e estiver tentando acessar uma rota protegida
  if (!session && isAccessingProtectedRoute) {
    console.log("Middleware: Unauthenticated user trying to access protected route, redirecting to login")
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Se estiver autenticado e estiver tentando acessar a página de login
  if (session && isAccessingLoginPage) {
    console.log("Middleware: Authenticated user trying to access login page, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Continuar com a resposta normal
  return res
}

// Configurar o matcher para aplicar o middleware apenas às rotas necessárias
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.svg (favicon files)
     * - images (public image files)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|images|.*\\..*$).*)",
  ],
}
