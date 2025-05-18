"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Client } from "@/types/database"

interface EditClientFormProps {
  client: Client
  tenantId: string
}

export function EditClientForm({ client, tenantId }: EditClientFormProps) {
  const [formData, setFormData] = useState({
    name: client.name,
    whatsapp: client.whatsapp,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validar dados
      if (!formData.name.trim()) throw new Error("O nome do cliente é obrigatório")
      if (!formData.whatsapp.trim()) throw new Error("O número de WhatsApp é obrigatório")

      // Validar formato do WhatsApp (apenas números)
      if (!/^\d+$/.test(formData.whatsapp)) {
        throw new Error("O número de WhatsApp deve conter apenas números, sem espaços ou caracteres especiais")
      }

      // Atualizar cliente
      const { error } = await supabase
        .from("clients")
        .update({
          name: formData.name.trim(),
          whatsapp: formData.whatsapp.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id)
        .eq("tenant_id", Number.parseInt(tenantId))

      if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`)

      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso.",
      })

      // Redirecionar para a lista de clientes
      router.push(`/dashboard/${tenantId}/clients`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao atualizar o cliente")
      console.error("Erro ao atualizar cliente:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número de WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="Ex: 5511999999999"
                required
                disabled={isLoading}
                maxLength={20}
              />
              <p className="text-xs text-gray-500">
                Formato internacional, sem espaços ou caracteres especiais. Ex: 5511999999999
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/${tenantId}/clients`)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
