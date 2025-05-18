"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addMinutes, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Loader2, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NewAppointmentFormProps {
  tenantId: string
  clients: { id: number; name: string }[]
  barbers: { id: number; name: string }[]
  services: { id: number; name: string; duration: number; price: number }[]
}

export function NewAppointmentForm({ tenantId, clients, barbers, services }: NewAppointmentFormProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    barberId: "",
    serviceId: "",
    date: new Date(),
    time: "09:00",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<{ duration: number; price: number } | null>(null)
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { toast } = useToast()

  // Verificar se temos dados disponíveis
  useEffect(() => {
    if (clients.length === 0) {
      setError("Não há clientes cadastrados. Adicione um cliente antes de criar um agendamento.")
    } else if (barbers.length === 0) {
      setError("Não há barbeiros cadastrados. Adicione um barbeiro antes de criar um agendamento.")
    } else if (services.length === 0) {
      setError("Não há serviços cadastrados. Adicione um serviço antes de criar um agendamento.")
    } else {
      setError(null)
    }
  }, [clients, barbers, services])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }))
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id.toString() === serviceId)
    setSelectedService(service || null)
    setFormData((prev) => ({ ...prev, serviceId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validar dados
      if (!formData.clientId) throw new Error("Selecione um cliente")
      if (!formData.barberId) throw new Error("Selecione um barbeiro")
      if (!formData.serviceId) throw new Error("Selecione um serviço")
      if (!formData.time) throw new Error("Selecione um horário")

      // Calcular horário de término
      const startTime = formData.time
      let endTime = startTime

      if (selectedService) {
        const startDate = parse(startTime, "HH:mm", new Date())
        const endDate = addMinutes(startDate, selectedService.duration)
        endTime = format(endDate, "HH:mm")
      }

      // Formatar data
      const formattedDate = format(formData.date, "yyyy-MM-dd")

      // Converter IDs para números
      const tenantIdNum = Number.parseInt(tenantId, 10)
      const clientIdNum = Number.parseInt(formData.clientId, 10)
      const barberIdNum = Number.parseInt(formData.barberId, 10)
      const serviceIdNum = Number.parseInt(formData.serviceId, 10)

      // Verificar se as conversões foram bem-sucedidas
      if (isNaN(tenantIdNum)) throw new Error("ID do tenant inválido")
      if (isNaN(clientIdNum)) throw new Error("ID do cliente inválido")
      if (isNaN(barberIdNum)) throw new Error("ID do barbeiro inválido")
      if (isNaN(serviceIdNum)) throw new Error("ID do serviço inválido")

      // Criar agendamento
      const { error: insertError } = await supabase.from("appointments").insert({
        tenant_id: tenantIdNum,
        client_id: clientIdNum,
        barber_id: barberIdNum,
        service_id: serviceIdNum,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        status: "confirmed",
      })

      if (insertError) {
        console.error("Erro ao inserir agendamento:", insertError)
        throw new Error(`Erro ao criar agendamento: ${insertError.message}`)
      }

      // Mostrar mensagem de sucesso
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      })

      // Redirecionar para a lista de agendamentos
      router.push(`/dashboard/${tenantId}/appointments`)
      router.refresh()
    } catch (err) {
      console.error("Erro completo:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao criar o agendamento")
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
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                  disabled={isLoading || clients.length === 0}
                >
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Nenhum cliente cadastrado
                      </SelectItem>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10" asChild>
                <Link href={`/dashboard/${tenantId}/clients/new`}>
                  <UserPlus className="h-4 w-4" />
                  <span className="sr-only">Novo Cliente</span>
                </Link>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barberId">Barbeiro</Label>
              <Select
                value={formData.barberId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, barberId: value }))}
                disabled={isLoading || barbers.length === 0}
              >
                <SelectTrigger id="barberId">
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum barbeiro cadastrado
                    </SelectItem>
                  ) : (
                    barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id.toString()}>
                        {barber.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Serviço</Label>
              <Select
                value={formData.serviceId}
                onValueChange={handleServiceChange}
                disabled={isLoading || services.length === 0}
              >
                <SelectTrigger id="serviceId">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum serviço cadastrado
                    </SelectItem>
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} -{" "}
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedService && (
                <p className="text-xs text-muted-foreground">Duração: {selectedService.duration} minutos</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                      locale={ptBR}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || clients.length === 0 || barbers.length === 0 || services.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Agendamento"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
