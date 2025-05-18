import { createServerSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Overview } from "@/components/overview"
import { RecentAppointments } from "@/components/recent-appointments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - AgendAI Barber",
  description: "Dashboard de gerenciamento da barbearia",
}

async function getTenantData(tenantId: string) {
  // Verificar se o tenantId é um número válido
  if (tenantId === "new-tenant") {
    return redirect("/dashboard/new-tenant")
  }

  const tenantIdNum = Number.parseInt(tenantId, 10)
  if (isNaN(tenantIdNum)) {
    console.error(`ID de tenant inválido: ${tenantId}`)
    return {
      shop: null,
      appointmentsCount: 0,
      clientsCount: 0,
      barbersCount: 0,
      recentAppointments: [],
    }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Verificar se o tenant existe
    const { data: shopData, error: shopError } = await supabase
      .from("barber_shops")
      .select("*")
      .eq("id", tenantIdNum)
      .single()

    if (shopError) {
      console.error(`Erro ao buscar dados da barbearia (ID: ${tenantIdNum}):`, shopError)
      return {
        shop: null,
        appointmentsCount: 0,
        clientsCount: 0,
        barbersCount: 0,
        recentAppointments: [],
      }
    }

    // Obter contagem de agendamentos
    const { count: appointmentsCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantIdNum)

    // Obter contagem de clientes
    const { count: clientsCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantIdNum)

    // Obter contagem de barbeiros
    const { count: barbersCount } = await supabase
      .from("barbers")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantIdNum)

    // Obter agendamentos recentes
    const { data: recentAppointments } = await supabase
      .from("appointments")
      .select(`
        *,
        client:clients(*),
        barber:barbers(*),
        service:services(*)
      `)
      .eq("tenant_id", tenantIdNum)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5)

    return {
      shop: shopData,
      appointmentsCount: appointmentsCount || 0,
      clientsCount: clientsCount || 0,
      barbersCount: barbersCount || 0,
      recentAppointments: recentAppointments || [],
    }
  } catch (error) {
    console.error(`Erro inesperado ao buscar dados do tenant (ID: ${tenantId}):`, error)
    return {
      shop: null,
      appointmentsCount: 0,
      clientsCount: 0,
      barbersCount: 0,
      recentAppointments: [],
    }
  }
}

export default async function DashboardPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params

  // Tratar casos especiais de rotas
  if (tenantId === "new-tenant") {
    redirect("/dashboard/new-tenant")
  }

  if (tenantId === "select-tenant") {
    redirect("/dashboard/select-tenant")
  }

  const data = await getTenantData(tenantId)

  if (!data.shop) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.appointmentsCount}</div>
                <p className="text-xs text-muted-foreground">Agendamentos realizados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.clientsCount}</div>
                <p className="text-xs text-muted-foreground">Clientes na base</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Barbeiros</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.barbersCount}</div>
                <p className="text-xs text-muted-foreground">Profissionais ativos</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentAppointments appointments={data.recentAppointments} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Análise de Serviços</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <p>Análise detalhada de serviços será implementada em breve.</p>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Desempenho dos Barbeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Análise de desempenho dos barbeiros será implementada em breve.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
