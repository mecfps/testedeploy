import { createServerSupabaseClient } from "@/lib/supabase"
import { AppointmentsTable } from "@/components/appointments-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agendamentos - AgendAI Barber",
  description: "Gerenciamento de agendamentos da barbearia",
}

async function getAppointments(tenantId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      client:clients(*),
      barber:barbers(*),
      service:services(*)
    `)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching appointments:", error)
    return []
  }

  return data || []
}

export default async function AppointmentsPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const appointments = await getAppointments(tenantId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
        <Link href={`/dashboard/${tenantId}/appointments/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </div>
      <AppointmentsTable appointments={appointments} tenantId={tenantId} />
    </div>
  )
}
