"use client"

import { useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export function InitScript() {
  useEffect(() => {
    const initAuth = async () => {
      const supabase = createClientSupabaseClient()

      // Verificar se há uma sessão ativa
      const { data } = await supabase.auth.getSession()

      console.log("Init Script: Session check", data.session ? "Session found" : "No session")

      // Configurar listener para mudanças de autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session ? "Session exists" : "No session")

        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, redirecting to dashboard")
          window.location.href = "/dashboard"
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, redirecting to login")
          window.location.href = "/"
        }
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    initAuth()
  }, [])

  return null
}
