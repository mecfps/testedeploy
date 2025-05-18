"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function DashboardRedirectPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const supabase = createClientSupabaseClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) throw new Error("Sessão inválida.")

        const { data: tenants, error: tenantsError } = await supabase
          .from("barber_shops")
          .select("*")
          .eq("user_id", session.user.id)

        if (tenantsError) throw tenantsError

        if (!tenants || tenants.length === 0) {
          router.replace("/dashboard/new-tenant")
        } else if (tenants.length === 1) {
          router.replace(`/dashboard/${tenants[0].id}`)
        } else {
          router.replace("/dashboard/select-tenant")
        }
      } catch (err: any) {
        console.error("Erro no redirecionamento:", err)
        setError("Erro ao redirecionar para sua barbearia.")
      } finally {
        setIsLoading(false)
      }
    }

    handleRedirect()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="px-4 py-2 bg-black text-white rounded">
            Voltar para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-black mx-auto mb-4" />
        <p className="text-gray-500">Carregando suas barbearias...</p>
      </div>
    </div>
  )
}
