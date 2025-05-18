import { createServerSupabaseClient } from "@/lib/supabase"
import { ServicesTable } from "@/components/services-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Serviços - AgendAI Barber",
  description: "Gerenciamento de serviços da barbearia",
}

async function getServices(tenantId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("services").select("*").eq("tenant_id", tenantId).order("name")

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return data || []
}

export default async function ServicesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const services = await getServices(tenantId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
        <Link href={`/dashboard/${tenantId}/services/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
        </Link>
      </div>
      <ServicesTable services={services} tenantId={tenantId} />
    </div>
  )
}
