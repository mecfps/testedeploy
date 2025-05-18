"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation" // ou 'next/router' se estiver usando Pages Router
import { createClientSupabaseClient } from "@/lib/supabase"

export function InitScript() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClientSupabaseClient()

    // Verificar sessão ativa (apenas para debug opcional)
    supabase.auth.getSession().then(({ data }) => {
      console.log("Init Script: Session check", data.session ? "Session found" : "No session")
    })

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")

      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, redirecting to dashboard")
        router.push("/dashboard")
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to login")
        router.push("/")
      }
    })

    // Cleanup do listener no unmount
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [router])

  return null
}
