"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Service } from "@/types/database"

interface EditServiceFormProps {
  service: Service
  tenantId: string
}

export function EditServiceForm({ service, tenantId }: EditServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service.name,
    duration: service.duration,
    price: service.price.toString(),
    description: service.description || "",
    active: service.active,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Permitir apenas números
    if (name === "duration" && /^\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? 0 : Number.parseInt(value) }))
    } else if (name === "price" && /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validar dados
      if (!formData.name.trim()) throw new Error("O nome do serviço é obrigatório")
      if (!formData.duration) throw new Error("A duração do serviço é obrigatória")
      if (!formData.price) throw new Error("O preço do serviço é obrigatório")

      // Converter preço para número
      const price = Number.parseFloat(formData.price.replace(",", "."))
      if (isNaN(price)) throw new Error("Preço inválido")

      // Atualizar serviço
      const { error } = await supabase
        .from("services")
        .update({
          name: formData.name.trim(),
          duration: formData.duration,
          price: price,
          description: formData.description.trim() || null,
          active: formData.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id)
        .eq("tenant_id", Number.parseInt(tenantId))

      if (error) throw new Error(`Erro ao atualizar serviço: ${error.message}`)

      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      })

      // Redirecionar para a lista de serviços
      router.push(`/dashboard/${tenantId}/services`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao atualizar o serviço")
      console.error("Erro ao atualizar serviço:", err)
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
              <Label htmlFor="name">Nome do Serviço</Label>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={formData.duration}
                  onChange={handleNumberChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleNumberChange}
                  placeholder="Ex: 50.00"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o serviço..."
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} disabled={isLoading} />
              <Label htmlFor="active">Serviço ativo</Label>
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
              onClick={() => router.push(`/dashboard/${tenantId}/services`)}
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
