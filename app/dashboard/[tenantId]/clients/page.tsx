import { createServerSupabaseClient } from "@/lib/supabase"
import { ClientsTable } from "@/components/clients-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clientes - AgendAI Barber",
  description: "Gerenciamento de clientes da barbearia",
}

async function getClients(tenantId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("clients").select("*").eq("tenant_id", tenantId).order("name")

  if (error) {
    console.error("Error fetching clients:", error)
    return []
  }

  return data || []
}

export default async function ClientsPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const clients = await getClients(tenantId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Link href={`/dashboard/${tenantId}/clients/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>
      <ClientsTable clients={clients} tenantId={tenantId} />
    </div>
  )
}
