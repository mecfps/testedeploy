import { createServerSupabaseClient } from "@/lib/supabase"
import { EditBarberForm } from "@/components/edit-barber-form"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Editar Barbeiro - AgendAI Barber",
  description: "Editar barbeiro existente",
}

async function getBarberData(tenantId: string, barberId: string) {
  const supabase = createServerSupabaseClient()

  // Verificar se os IDs são números válidos
  const tenantIdNum = Number.parseInt(tenantId, 10)
  const barberIdNum = Number.parseInt(barberId, 10)

  if (isNaN(tenantIdNum) || isNaN(barberIdNum)) {
    return null
  }

  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("tenant_id", tenantIdNum)
    .eq("id", barberIdNum)
    .single()

  if (error) {
    console.error("Erro ao buscar barbeiro:", error)
    return null
  }

  return data
}

export default async function EditBarberPage({ params }: { params: { tenantId: string; id: string } }) {
  const { tenantId, id } = params

  // Verificar se os IDs são números válidos
  if (isNaN(Number.parseInt(tenantId, 10)) || isNaN(Number.parseInt(id, 10))) {
    redirect(`/dashboard/${tenantId}/barbers`)
  }

  const barber = await getBarberData(tenantId, id)

  if (!barber) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Editar Barbeiro</h2>
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
              <h3 className="text-sm font-medium text-red-800">Barbeiro não encontrado</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Não foi possível encontrar os dados do barbeiro.</p>
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
        <h2 className="text-3xl font-bold tracking-tight">Editar Barbeiro</h2>
      </div>
      <EditBarberForm barber={barber} tenantId={tenantId} />
    </div>
  )
}
