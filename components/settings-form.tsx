"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { Tenant, ShopSettings } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface SettingsFormProps {
  shop: Tenant
  settings: ShopSettings
  tenantId: string
}

export function SettingsForm({ shop, settings, tenantId }: SettingsFormProps) {
  const [shopData, setShopData] = useState<Tenant>(shop)
  const [settingsData, setSettingsData] = useState<ShopSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const daysOfWeek = [
    { id: 0, name: "Domingo" },
    { id: 1, name: "Segunda-feira" },
    { id: 2, name: "Terça-feira" },
    { id: 3, name: "Quarta-feira" },
    { id: 4, name: "Quinta-feira" },
    { id: 5, name: "Sexta-feira" },
    { id: 6, name: "Sábado" },
  ]

  const handleShopChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setShopData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettingsData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDayToggle = (day: number) => {
    setSettingsData((prev) => {
      const currentDays = [...prev.days_open]
      const index = currentDays.indexOf(day)

      if (index === -1) {
        currentDays.push(day)
      } else {
        currentDays.splice(index, 1)
      }

      return { ...prev, days_open: currentDays }
    })
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Atualizar dados da barbearia
      const { error: shopError } = await supabase
        .from("barber_shops")
        .update({
          name: shopData.name,
          owner_name: shopData.owner_name,
          email: shopData.email,
          whatsapp_number: shopData.whatsapp_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenantId)

      if (shopError) {
        throw new Error(`Erro ao atualizar dados da barbearia: ${shopError.message}`)
      }

      // Verificar se as configurações já existem
      const { data: existingSettings, error: checkError } = await supabase
        .from("shop_settings")
        .select("id")
        .eq("tenant_id", tenantId)
        .maybeSingle()

      if (checkError) {
        throw new Error(`Erro ao verificar configurações existentes: ${checkError.message}`)
      }

      if (existingSettings) {
        // Atualizar configurações existentes
        const { error: settingsError } = await supabase
          .from("shop_settings")
          .update({
            opening_time: settingsData.opening_time,
            closing_time: settingsData.closing_time,
            days_open: settingsData.days_open,
            slot_duration: Number.parseInt(settingsData.slot_duration.toString()),
            cancellation_policy: settingsData.cancellation_policy,
            updated_at: new Date().toISOString(),
          })
          .eq("tenant_id", tenantId)

        if (settingsError) {
          throw new Error(`Erro ao atualizar configurações: ${settingsError.message}`)
        }
      } else {
        // Criar novas configurações
        const { error: settingsError } = await supabase.from("shop_settings").insert({
          tenant_id: Number.parseInt(tenantId),
          opening_time: settingsData.opening_time,
          closing_time: settingsData.closing_time,
          days_open: settingsData.days_open,
          slot_duration: Number.parseInt(settingsData.slot_duration.toString()),
          cancellation_policy: settingsData.cancellation_policy,
        })

        if (settingsError) {
          throw new Error(`Erro ao criar configurações: ${settingsError.message}`)
        }
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar as configurações.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="schedule">Horários</TabsTrigger>
        <TabsTrigger value="policies">Políticas</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>Configure as informações básicas da sua barbearia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Barbearia</Label>
              <Input id="name" name="name" value={shopData.name} onChange={handleShopChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner_name">Nome do Proprietário</Label>
              <Input id="owner_name" name="owner_name" value={shopData.owner_name} onChange={handleShopChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" value={shopData.email} onChange={handleShopChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">Número de WhatsApp</Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                value={shopData.whatsapp_number || ""}
                onChange={handleShopChange}
                placeholder="Ex: 5511999999999"
              />
              <p className="text-xs text-gray-500">
                Formato internacional, sem espaços ou caracteres especiais. Ex: 5511999999999
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <CardTitle>Horários de Funcionamento</CardTitle>
            <CardDescription>Configure os horários e dias de funcionamento da sua barbearia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opening_time">Horário de Abertura</Label>
                <Input
                  id="opening_time"
                  name="opening_time"
                  type="time"
                  value={settingsData.opening_time}
                  onChange={handleSettingsChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing_time">Horário de Fechamento</Label>
                <Input
                  id="closing_time"
                  name="closing_time"
                  type="time"
                  value={settingsData.closing_time}
                  onChange={handleSettingsChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot_duration">Duração do Slot (minutos)</Label>
              <Input
                id="slot_duration"
                name="slot_duration"
                type="number"
                min="5"
                step="5"
                value={settingsData.slot_duration}
                onChange={handleSettingsChange}
              />
              <p className="text-xs text-gray-500">Define o intervalo mínimo entre agendamentos.</p>
            </div>
            <div className="space-y-2">
              <Label>Dias de Funcionamento</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={settingsData.days_open.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <Label htmlFor={`day-${day.id}`} className="cursor-pointer">
                      {day.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="policies">
        <Card>
          <CardHeader>
            <CardTitle>Políticas</CardTitle>
            <CardDescription>Configure as políticas de cancelamento e reagendamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Política de Cancelamento</Label>
              <Textarea
                id="cancellation_policy"
                name="cancellation_policy"
                value={settingsData.cancellation_policy || ""}
                onChange={handleSettingsChange}
                rows={5}
                placeholder="Descreva aqui a política de cancelamento da sua barbearia..."
              />
              <p className="text-xs text-gray-500">
                Esta política será exibida para os clientes ao fazer um agendamento.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
