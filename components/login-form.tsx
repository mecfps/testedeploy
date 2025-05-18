"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import { redirectBasedOnTenants } from "@/lib/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const supabase = createClientSupabaseClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Realizar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        if (error.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("E-mail não confirmado. Verifique sua caixa de entrada.")
        } else {
          setError(error.message)
        }
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("Erro ao autenticar usuário.")
        setIsLoading(false)
        return
      }

      console.log("User authenticated:", data.user.id)

      // Redirecionar com base nos tenants
      try {
        await redirectBasedOnTenants()
      } catch (err) {
        console.error("Error redirecting:", err)
        setError("Erro ao redirecionar. Tente novamente.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Unexpected error during login:", err)
      setError("Ocorreu um problema de conexão. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/recuperar-senha" className="text-xs text-gray-500 hover:text-black">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link href="/criar-conta" className="font-medium text-black hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
