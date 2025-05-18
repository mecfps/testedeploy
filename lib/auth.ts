import { createClientSupabaseClient } from "./supabase"

export async function redirectBasedOnTenants() {
  const supabase = createClientSupabaseClient()

  try {
    // Verificar se o usuário está autenticado
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      console.log("No session found, redirecting to login")
      window.location.href = "/"
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      console.log("No user found, redirecting to login")
      window.location.href = "/"
      return
    }

    console.log("User found:", userData.user.id)

    // Buscar todos os tenants vinculados ao usuário
    const { data: userTenantsData, error: tenantsError } = await supabase
      .from("user_tenants")
      .select("tenant_id")
      .eq("user_id", userData.user.id)

    if (tenantsError) {
      console.error("Error fetching user tenants:", tenantsError)
      throw new Error("Erro ao buscar informações da barbearia.")
    }

    console.log("User tenants data:", userTenantsData)

    if (!userTenantsData || userTenantsData.length === 0) {
      console.log("No tenants found, redirecting to new-tenant")
      window.location.href = "/dashboard/new-tenant"
      return
    }

    if (userTenantsData.length === 1) {
      console.log("One tenant found, redirecting to dashboard")
      window.location.href = `/dashboard/${userTenantsData[0].tenant_id}`
      return
    }

    console.log("Multiple tenants found, redirecting to select-tenant")
    window.location.href = "/dashboard/select-tenant"
  } catch (error) {
    console.error("Error in redirectBasedOnTenants:", error)
    throw error
  }
}
