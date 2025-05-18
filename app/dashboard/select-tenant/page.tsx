"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

export default function SelectTenantPage() {
  const { userTenants, setCurrentTenant, isLoading, refreshTenants } = useTenant()
  const router = useRouter()

  useEffect(() => {
    // Garantir que os dados de tenants estejam atualizados
    refreshTenants()
  }, [refreshTenants])

  useEffect(() => {
    if (!isLoading && userTenants.length === 0) {
      console.log("No tenants found, redirecting to new-tenant")
      router.push("/dashboard/new-tenant")
    }
  }, [isLoading, userTenants, router])

  const handleSelectTenant = (tenantId: number) => {
    const tenant = userTenants.find((t) => t.id === tenantId)
    if (tenant) {
      console.log("Selecting tenant:", tenant.id)
      setCurrentTenant(tenant)
      router.push(`/dashboard/${tenant.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Selecione uma Barbearia</CardTitle>
            <CardDescription className="text-center">Escolha qual barbearia você deseja gerenciar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTenants.map((tenant) => (
                <Button
                  key={tenant.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleSelectTenant(tenant.id)}
                >
                  <div>
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-sm text-gray-500">{tenant.email}</div>
                  </div>
                </Button>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4 flex items-center justify-center"
                onClick={() => router.push("/dashboard/new-tenant")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Barbearia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
