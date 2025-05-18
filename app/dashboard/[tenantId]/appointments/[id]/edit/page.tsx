import { createServerSupabaseClient } from "@/lib/supabase"
import { EditAppointmentForm } from "@/components/edit-appointment-form"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Editar Agendamento - AgendAI Barber",
  description: "Editar agendamento existente",
}

async function getFormData(tenantId: string, appointmentId: string) {
  const supabase = createServerSupabaseClient()

  // Verificar se os IDs são números válidos
  const tenantIdNum = Number.parseInt(tenantId, 10)
  const appointmentIdNum = Number.parseInt(appointmentId, 10)

  if (isNaN(tenantIdNum) || isNaN(appointmentIdNum)) {
    return {
      appointment: null,
      clients: [],
      barbers: [],
      services: [],
    }
  }

  // Buscar agendamento
  const { data: appointment, error: appointmentError } = await supabase
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

  if (appointmentError) {
    console.error("Erro ao buscar agendamento:", appointmentError)
    return {
      appointment: null,
      clients: [],
      barbers: [],
      services: [],
    }
  }

  // Buscar clientes
  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name")
    .eq("tenant_id", tenantIdNum)
    .order("name")

  if (clientsError) {
    console.error("Erro ao buscar clientes:", clientsError)
  }

  // Buscar barbeiros
  const { data: barbers, error: barbersError } = await supabase
    .from("barbers")
    .select("id, name")
    .eq("tenant_id", tenantIdNum)
    .order("name")

  if (barbersError) {
    console.error("Erro ao buscar barbeiros:", barbersError)
  }

  // Buscar serviços
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, name, duration, price")
    .eq("tenant_id", tenantIdNum)
    .order("name")

  if (servicesError) {
    console.error("Erro ao buscar serviços:", servicesError)
  }

  return {
    appointment,
    clients: clients || [],
    barbers: barbers || [],
    services: services || [],
  }
}

export default async function EditAppointmentPage({ params }: { params: { tenantId: string; id: string } }) {
  const { tenantId, id } = params

  // Verificar se os IDs são números válidos
  if (isNaN(Number.parseInt(tenantId, 10)) || isNaN(Number.parseInt(id, 10))) {
    redirect(`/dashboard/${tenantId}/appointments`)
  }

  const { appointment, clients, barbers, services } = await getFormData(tenantId, id)

  if (!appointment) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Editar Agendamento</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">Editar Agendamento</h2>
      </div>
      <EditAppointmentForm
        appointment={appointment}
        clients={clients}
        barbers={barbers}
        services={services}
        tenantId={tenantId}
      />
    </div>
  )
}
