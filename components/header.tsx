"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useTenant } from "@/contexts/tenant-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronDown } from "lucide-react"

export function Header() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientSupabaseClient()
  const { currentTenant, userTenants } = useTenant()

  // Verificar se estamos na página de criação de tenant
  const isNewTenantPage = pathname === "/dashboard/new-tenant"

  // Se estiver na página de criação de tenant, não mostrar o header
  if (isNewTenantPage) {
    return null
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/")
    setIsLoggingOut(false)
  }

  const switchTenant = () => {
    router.push("/dashboard/select-tenant")
  }

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{currentTenant ? currentTenant.name : "Dashboard"}</h1>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline-block">{currentTenant ? currentTenant.owner_name : "Usuário"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userTenants.length > 1 && <DropdownMenuItem onClick={switchTenant}>Trocar Barbearia</DropdownMenuItem>}
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
