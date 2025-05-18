import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { AppointmentWithDetails } from "@/types/database"
import { Badge } from "@/components/ui/badge"

interface RecentAppointmentsProps {
  appointments: AppointmentWithDetails[]
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmado</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {appointments.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum agendamento encontrado.</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{appointment.client.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR })} às{" "}
                {appointment.start_time.substring(0, 5)}
              </p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-2">
              <p className="text-sm font-medium">{appointment.service.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{appointment.barber.name}</p>
                {getStatusBadge(appointment.status)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
