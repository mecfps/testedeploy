import { createServerSupabaseClient } from "@/lib/supabase"
import { NewAppointmentForm } from "@/components/new-appointment-form"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novo Agendamento - AgendAI Barber",
  description: "Criar novo agendamento",
}

async function getFormData(tenantId: string) {
  const supabase = createServerSupabaseClient()

  // Verificar se o tenantId é um número válido
  const tenantIdNum = Number.parseInt(tenantId, 10)
  if (isNaN(tenantIdNum)) {
    console.error("ID de tenant inválido:", tenantId)
    return {
      clients: [],
      barbers: [],
      services: [],
    }
  }

  try {
    // Buscar clientes
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("tenant_id", tenantIdNum)
      .order("name")

    if (clientsError) {
      console.error("Erro ao buscar clientes:", clientsError)
    }

    // Buscar barbeiros ativos
    const { data: barbers, error: barbersError } = await supabase
      .from("barbers")
      .select("id, name")
      .eq("tenant_id", tenantIdNum)
      .eq("status", "active")
      .order("name")

    if (barbersError) {
      console.error("Erro ao buscar barbeiros:", barbersError)
    }

    // Buscar serviços ativos
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, duration, price")
      .eq("tenant_id", tenantIdNum)
      .eq("active", true)
      .order("name")

    if (servicesError) {
      console.error("Erro ao buscar serviços:", servicesError)
    }

    return {
      clients: clients || [],
      barbers: barbers || [],
      services: services || [],
    }
  } catch (error) {
    console.error("Erro ao buscar dados para o formulário:", error)
    return {
      clients: [],
      barbers: [],
      services: [],
    }
  }
}

export default async function NewAppointmentPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params

  // Verificar se o tenantId é um número válido
  if (isNaN(Number.parseInt(tenantId, 10))) {
    redirect("/dashboard")
  }

  const { clients, barbers, services } = await getFormData(tenantId)

  // Adicionar logs para depuração
  console.log("Clientes carregados:", clients.length)
  console.log("Barbeiros carregados:", barbers.length)
  console.log("Serviços carregados:", services.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Novo Agendamento</h2>
      </div>
      <NewAppointmentForm tenantId={tenantId} clients={clients} barbers={barbers} services={services} />
    </div>
  )
}
