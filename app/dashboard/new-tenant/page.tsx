"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function NewTenantPage() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { refreshTenants } = useTenant()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Verificar se o usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Usuário não autenticado. Faça login novamente.")
        setIsLoading(false)
        return
      }

      // Criar nova barbearia
      const { data: newShop, error: shopError } = await supabase
        .from("barber_shops")
        .insert([
          {
            name,
            email,
            phone,
            owner_name: ownerName,
          },
        ])
        .select()
        .single()

      if (shopError) {
        console.error("Error creating shop:", shopError)
        setError("Erro ao criar barbearia. Tente novamente.")
        setIsLoading(false)
        return
      }

      // Vincular usuário à barbearia
      const { error: linkError } = await supabase.from("user_tenants").insert([
        {
          user_id: user.id,
          tenant_id: newShop.id,
          role: "owner",
        },
      ])

      if (linkError) {
        console.error("Error linking user to shop:", linkError)
        setError("Erro ao vincular usuário à barbearia. Tente novamente.")
        setIsLoading(false)
        return
      }

      // Atualizar lista de tenants
      await refreshTenants()

      // Redirecionar para o dashboard da nova barbearia
      router.push(`/dashboard/${newShop.id}`)
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Nova Barbearia</CardTitle>
            <CardDescription className="text-center">Crie sua barbearia para começar a usar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Barbearia</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail da Barbearia</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone da Barbearia</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Seu Nome (Proprietário)</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Barbearia"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
