"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { Tenant } from "@/types/database"

type TenantContextType = {
  currentTenant: Tenant | null
  setCurrentTenant: (tenant: Tenant | null) => void
  isLoading: boolean
  userTenants: Tenant[]
  refreshTenants: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [userTenants, setUserTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientSupabaseClient()

  const fetchUserTenants = useCallback(async () => {
    try {
      console.log("TenantContext: Fetching user tenants, current path:", pathname)

      // Verificar se estamos na página de criação de tenant
      if (pathname === "/dashboard/new-tenant") {
        setIsLoading(false)
        return
      }

      // Verificar se o usuário está autenticado
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("TenantContext: No session found")
        setIsLoading(false)
        window.location.href = "/"
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("TenantContext: No user found in session")
        setIsLoading(false)
        window.location.href = "/"
        return
      }

      console.log("TenantContext: User found:", user.id)

      // Buscar todos os tenants vinculados ao usuário
      const { data: userTenantsData, error } = await supabase
        .from("user_tenants")
        .select("tenant_id")
        .eq("user_id", user.id)

      if (error) {
        console.error("TenantContext: Error fetching user tenants:", error)
        setIsLoading(false)
        return
      }

      console.log("TenantContext: User tenants data:", userTenantsData)

      if (!userTenantsData || userTenantsData.length === 0) {
        console.log("TenantContext: No tenants found for user")
        setIsLoading(false)

        // Se estamos na página de dashboard e não temos tenants, redirecionar para criar novo
        if (pathname === "/dashboard") {
          window.location.href = "/dashboard/new-tenant"
        }
        return
      }

      const tenantIds = userTenantsData.map((ut) => ut.tenant_id)

      // Buscar detalhes de todos os tenants
      const { data: tenants, error: tenantsError } = await supabase.from("barber_shops").select("*").in("id", tenantIds)

      if (tenantsError) {
        console.error("TenantContext: Error fetching tenants:", tenantsError)
        setIsLoading(false)
        return
      }

      console.log("TenantContext: Tenants data:", tenants)

      if (tenants && tenants.length > 0) {
        setUserTenants(tenants)

        // Verificar se há um tenant_id na URL
        const tenantIdMatch = pathname.match(/\/dashboard\/(\d+)/)

        if (tenantIdMatch) {
          const tenantId = Number.parseInt(tenantIdMatch[1])
          const tenant = tenants.find((t) => t.id === tenantId)

          if (tenant) {
            console.log("TenantContext: Setting current tenant from URL:", tenant.id)
            setCurrentTenant(tenant)
          } else if (tenants.length > 0) {
            // Se o tenant da URL não for encontrado, use o primeiro
            console.log("TenantContext: Tenant from URL not found, using first tenant:", tenants[0].id)
            setCurrentTenant(tenants[0])
            // Redirecionar para o dashboard do primeiro tenant
            if (!pathname.includes("/new-tenant") && !pathname.includes("/select-tenant")) {
              console.log("TenantContext: Redirecting to first tenant dashboard")
              window.location.href = `/dashboard/${tenants[0].id}`
            }
          }
        } else if (tenants.length === 1 && pathname === "/dashboard") {
          // Se temos apenas um tenant e estamos na rota principal, definimos como atual
          console.log("TenantContext: Only one tenant and on dashboard route, setting current tenant:", tenants[0].id)
          setCurrentTenant(tenants[0])
          // Redirecionar para o dashboard desse tenant
          console.log("TenantContext: Redirecting to tenant dashboard")
          window.location.href = `/dashboard/${tenants[0].id}`
        } else if (tenants.length > 1 && pathname === "/dashboard") {
          // Se temos múltiplos tenants e estamos na rota principal, redirecionar para seleção
          console.log("TenantContext: Multiple tenants and on dashboard route, redirecting to select-tenant")
          window.location.href = "/dashboard/select-tenant"
        }
      } else {
        // Se não encontramos nenhum tenant, mas temos IDs, pode ser um problema de permissão
        console.log("TenantContext: No tenants found but tenant IDs exist, possible permission issue")
        if (pathname === "/dashboard") {
          window.location.href = "/dashboard/new-tenant"
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error("TenantContext: Error in fetchUserTenants:", error)
      setIsLoading(false)
    }
  }, [pathname, router, supabase])

  useEffect(() => {
    console.log("TenantContext: useEffect triggered, pathname:", pathname)
    fetchUserTenants()
  }, [pathname, fetchUserTenants])

  const refreshTenants = async () => {
    setIsLoading(true)
    await fetchUserTenants()
  }

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setCurrentTenant,
        isLoading,
        userTenants,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
