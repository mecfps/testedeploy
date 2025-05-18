import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json({ error: `Erro ao verificar sessão: ${sessionError.message}` }, { status: 500 })
    }

    if (!sessionData.session) {
      return NextResponse.json({ error: "Nenhuma sessão encontrada" }, { status: 401 })
    }

    // Verificar usuário
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({ error: `Erro ao verificar usuário: ${userError.message}` }, { status: 500 })
    }

    if (!userData.user) {
      return NextResponse.json({ error: "Nenhum usuário encontrado" }, { status: 401 })
    }

    // Verificar tenants
    const { data: tenantData, error: tenantError } = await supabase
      .from("user_tenants")
      .select("tenant_id")
      .eq("user_id", userData.user.id)

    if (tenantError) {
      return NextResponse.json({ error: `Erro ao verificar tenants: ${tenantError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      session: sessionData,
      user: userData,
      tenants: tenantData,
    })
  } catch (error) {
    return NextResponse.json({ error: `Erro inesperado: ${error}` }, { status: 500 })
  }
}
