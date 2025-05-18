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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { format, addMinutes, parse, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppointmentWithDetails } from "@/types/database"

interface EditAppointmentFormProps {
  appointment: AppointmentWithDetails
  clients: { id: number; name: string }[]
  barbers: { id: number; name: string }[]
  services: { id: number; name: string; duration: number; price: number }[]
  tenantId: string
}

export function EditAppointmentForm({ appointment, clients, barbers, services, tenantId }: EditAppointmentFormProps) {
  const [formData, setFormData] = useState({
    clientId: appointment.client_id.toString(),
    barberId: appointment.barber_id.toString(),
    serviceId: appointment.service_id.toString(),
    date: parseISO(appointment.date),
    time: appointment.start_time.substring(0, 5),
    status: appointment.status,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<{ duration: number; price: number } | null>(null)
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { toast } = useToast()

  // Inicializar o serviço selecionado
  useEffect(() => {
    const service = services.find((s) => s.id === appointment.service_id)
    if (service) {
      setSelectedService({
        duration: service.duration,
        price: service.price,
      })
    }
  }, [appointment.service_id, services])

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

  const handleStatusChange = (status: string) => {
    setFormData((prev) => ({ ...prev, status }))
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

      // Atualizar agendamento
      const { error } = await supabase
        .from("appointments")
        .update({
          client_id: Number.parseInt(formData.clientId),
          barber_id: Number.parseInt(formData.barberId),
          service_id: Number.parseInt(formData.serviceId),
          date: formattedDate,
          start_time: startTime,
          end_time: endTime,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.id)
        .eq("tenant_id", Number.parseInt(tenantId))

      if (error) throw new Error(`Erro ao atualizar agendamento: ${error.message}`)

      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      })

      // Redirecionar para a lista de agendamentos
      router.push(`/dashboard/${tenantId}/appointments`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao atualizar o agendamento")
      console.error("Erro ao atualizar agendamento:", err)
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
              <Label htmlFor="clientId">Cliente</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                disabled={isLoading}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barberId">Barbeiro</Label>
              <Select
                value={formData.barberId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, barberId: value }))}
                disabled={isLoading}
              >
                <SelectTrigger id="barberId">
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id.toString()}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Serviço</Label>
              <Select value={formData.serviceId} onValueChange={handleServiceChange} disabled={isLoading}>
                <SelectTrigger id="serviceId">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} -{" "}
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)}
                    </SelectItem>
                  ))}
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

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={handleStatusChange}
                className="flex gap-4"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confirmed" id="confirmed" />
                  <Label htmlFor="confirmed" className="cursor-pointer">
                    Confirmado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending" className="cursor-pointer">
                    Pendente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cancelled" id="cancelled" />
                  <Label htmlFor="cancelled" className="cursor-pointer">
                    Cancelado
                  </Label>
                </div>
              </RadioGroup>
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
              onClick={() => router.push(`/dashboard/${tenantId}/appointments`)}
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
