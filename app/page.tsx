"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClientSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [])

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-8 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Image src="/logo.svg" alt="AgendAI Barber" width={180} height={48} className="h-12 w-auto" priority />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bem-vindo de volta</h1>
            <p className="text-center text-sm text-gray-500">Entre com suas credenciais para acessar sua conta</p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden bg-black md:flex md:w-1/2 md:items-center md:justify-center">
        {/* ... seu conteúdo permanece o mesmo */}
      </div>
    </div>
  )
}
