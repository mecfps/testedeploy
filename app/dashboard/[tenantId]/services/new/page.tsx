import { NewServiceForm } from "@/components/new-service-form"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novo Serviço - AgendAI Barber",
  description: "Adicionar novo serviço",
}

export default function NewServicePage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params

  // Verificar se o tenantId é um número válido
  if (isNaN(Number.parseInt(tenantId, 10))) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Novo Serviço</h2>
      </div>
      <NewServiceForm tenantId={tenantId} />
    </div>
  )
}
