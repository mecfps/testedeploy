import { createServerSupabaseClient } from "@/lib/supabase"
import { BarbersTable } from "@/components/barbers-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Barbeiros - AgendAI Barber",
  description: "Gerenciamento de barbeiros da barbearia",
}

async function getBarbers(tenantId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("barbers").select("*").eq("tenant_id", tenantId).order("name")

  if (error) {
    console.error("Error fetching barbers:", error)
    return []
  }

  return data || []
}

export default async function BarbersPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const barbers = await getBarbers(tenantId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Barbeiros</h2>
        <Link href={`/dashboard/${tenantId}/barbers/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Barbeiro
          </Button>
        </Link>
      </div>
      <BarbersTable barbers={barbers} tenantId={tenantId} />
    </div>
  )
}
