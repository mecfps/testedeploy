import { createServerSupabaseClient } from "@/lib/supabase"
import { AppointmentDetails } from "@/components/appointment-details"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Detalhes do Agendamento - AgendAI Barber",
  description: "Visualizar detalhes do agendamento",
}

async function getAppointmentData(tenantId: string, appointmentId: string) {
  const supabase = createServerSupabaseClient()

  // Verificar se os IDs são números válidos
  const tenantIdNum = Number.parseInt(tenantId, 10)
  const appointmentIdNum = Number.parseInt(appointmentId, 10)

  if (isNaN(tenantIdNum) || isNaN(appointmentIdNum)) {
    return null
  }

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      client:clients(*),
      barber:barbers(*),
      service:services(*)
    `)
    .eq("tenant_id", tenantIdNum)
    .eq("id", appointmentIdNum)
    .single()

  if (error) {
    console.error("Erro ao buscar agendamento:", error)
    return null
  }

  return data
}

export default async function AppointmentDetailsPage({ params }: { params: { tenantId: string; id: string } }) {
  const { tenantId, id } = params

  // Verificar se os IDs são números válidos
  if (isNaN(Number.parseInt(tenantId, 10)) || isNaN(Number.parseInt(id, 10))) {
    redirect(`/dashboard/${tenantId}/appointments`)
  }

  const appointment = await getAppointmentData(tenantId, id)

  if (!appointment) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Agendamento</h2>
        </div>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Agendamento não encontrado</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Não foi possível encontrar os dados do agendamento.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Detalhes do Agendamento</h2>
      </div>
      <AppointmentDetails appointment={appointment} tenantId={tenantId} />
    </div>
  )
}
