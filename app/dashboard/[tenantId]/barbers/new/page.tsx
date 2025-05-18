import { NewBarberForm } from "@/components/new-barber-form"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novo Barbeiro - AgendAI Barber",
  description: "Adicionar novo barbeiro",
}

export default function NewBarberPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params

  // Verificar se o tenantId é um número válido
  if (isNaN(Number.parseInt(tenantId, 10))) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Novo Barbeiro</h2>
      </div>
      <NewBarberForm tenantId={tenantId} />
    </div>
  )
}
