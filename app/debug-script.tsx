"use client"

import { useEffect } from "react"

export function DebugScript() {
  useEffect(() => {
    console.log("=== DEBUG SCRIPT STARTED ===")

    // Verificar sessão
    const checkSession = async () => {
      try {
        const supabase = (window as any).supabase

        if (!supabase) {
          console.log("Supabase client not found in window object")
          return
        }

        console.log("Session: Found")

        const { data } = await supabase.auth.getSession()

        if (data.session) {
          console.log(`Session expires at: ${new Date(data.session.expires_at * 1000).toLocaleString()}`)
          console.log(`Current time: ${new Date().toLocaleString()}`)

          const { data: userData } = await supabase.auth.getUser()

          if (userData.user) {
            console.log(`User: Found (${userData.user.id})`)

            const { data: tenantData } = await supabase
              .from("user_tenants")
              .select("tenant_id")
              .eq("user_id", userData.user.id)

            if (tenantData) {
              console.log(`User tenants: Found (${tenantData.length})`)
              console.log("Tenant IDs: ", tenantData)

              if (tenantData.length > 0) {
                const tenantIds = tenantData.map((t: any) => t.tenant_id)

                const { data: tenantsDetails } = await supabase.from("barber_shops").select("*").in("id", tenantIds)

                console.log(`Tenants details: Found (${tenantsDetails ? tenantsDetails.length : 0})`)

                if (tenantsDetails && tenantsDetails.length > 0) {
                  console.log("First tenant: ", tenantsDetails[0])
                }
              }
            }
          }
        } else {
          console.log("No session found")
        }
      } catch (error) {
        console.error("Error in debug script:", error)
      }
    }

    checkSession()

    console.log("=== DEBUG SCRIPT COMPLETED ===")
  }, [])

  return null
}
