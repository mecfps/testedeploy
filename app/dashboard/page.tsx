"use client"

import { useEffect, useState } from "react"
import { redirectBasedOnTenants } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        console.log("Dashboard: Checking user session")
        await redirectBasedOnTenants()
      } catch (error) {
        console.error("Dashboard: Error in checkUserAndRedirect:", error)
        setError("Ocorreu um erro ao verificar suas informações.")
        setIsLoading(false)
      }
    }

    checkUserAndRedirect()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => (window.location.href = "/")} className="px-4 py-2 bg-black text-white rounded">
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
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    </div>
  )
}
