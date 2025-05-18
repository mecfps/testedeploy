"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClientSupabaseClient()

        // Verificar sessão
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          setError(`Erro ao verificar sessão: ${sessionError.message}`)
          return
        }

        setSessionInfo(sessionData)

        if (!sessionData.session) {
          setError("Nenhuma sessão encontrada")
          return
        }

        // Verificar usuário
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          setError(`Erro ao verificar usuário: ${userError.message}`)
          return
        }

        setUserInfo(userData)

        if (!userData.user) {
          setError("Nenhum usuário encontrado")
          return
        }

        // Verificar tenants
        const { data: tenantData, error: tenantError } = await supabase
          .from("user_tenants")
          .select("tenant_id")
          .eq("user_id", userData.user.id)

        if (tenantError) {
          setError(`Erro ao verificar tenants: ${tenantError.message}`)
          return
        }

        setTenantInfo(tenantData)
      } catch (err) {
        setError(`Erro inesperado: ${err}`)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Página de Diagnóstico</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Informações da Sessão</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">{JSON.stringify(sessionInfo, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Informações do Usuário</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">{JSON.stringify(userInfo, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Informações dos Tenants</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">{JSON.stringify(tenantInfo, null, 2)}</pre>
        </div>

        <div className="mt-4">
          <button onClick={() => (window.location.href = "/")} className="px-4 py-2 bg-black text-white rounded mr-2">
            Voltar para o Login
          </button>

          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 text-black rounded">
            Atualizar Informações
          </button>
        </div>
      </div>
    </div>
  )
}
