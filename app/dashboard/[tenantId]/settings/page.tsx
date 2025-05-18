import { createServerSupabaseClient } from "@/lib/supabase"
import { SettingsForm } from "@/components/settings-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações - AgendAI Barber",
  description: "Configurações da barbearia",
}

async function getSettings(tenantId: string) {
  const supabase = createServerSupabaseClient()

  // Obter dados da barbearia
  const { data: shopData, error: shopError } = await supabase
    .from("barber_shops")
    .select("*")
    .eq("id", tenantId)
    .single()

  if (shopError) {
    console.error("Error fetching shop data:", shopError)
    return { shop: null, settings: null }
  }

  // Obter configurações da barbearia
  const { data: settingsData, error: settingsError } = await supabase
    .from("shop_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single()

  if (settingsError && settingsError.code !== "PGRST116") {
    // PGRST116 é o código para "nenhum resultado encontrado"
    console.error("Error fetching settings:", settingsError)
  }

  return {
    shop: shopData,
    settings: settingsData || {
      tenant_id: Number.parseInt(tenantId),
      opening_time: "09:00",
      closing_time: "19:00",
      days_open: [1, 2, 3, 4, 5, 6],
      slot_duration: 30,
      cancellation_policy: null,
    },
  }
}

export default async function SettingsPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { shop, settings } = await getSettings(tenantId)

  if (!shop) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
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
              <h3 className="text-sm font-medium text-red-800">Barbearia não encontrada</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Não foi possível encontrar os dados da barbearia.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      <SettingsForm shop={shop} settings={settings} tenantId={tenantId} />
    </div>
  )
}
