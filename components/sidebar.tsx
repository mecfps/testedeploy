"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { Calendar, Users, Scissors, List, MessageSquare, Settings, Menu, X, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { currentTenant } = useTenant()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Verificar se estamos na página de criação de tenant
  const isNewTenantPage = pathname === "/dashboard/new-tenant"

  // Se estiver na página de criação de tenant, não mostrar a barra lateral
  if (isNewTenantPage) {
    return null
  }

  // Garantir que temos um tenant válido
  const tenantId = currentTenant?.id

  // Só criar os links de navegação se tivermos um tenant válido
  const navigation = tenantId
    ? [
        {
          name: "Dashboard",
          href: `/dashboard/${tenantId}`,
          icon: LayoutDashboard,
          current: pathname === `/dashboard/${tenantId}`,
        },
        {
          name: "Agendamentos",
          href: `/dashboard/${tenantId}/appointments`,
          icon: Calendar,
          current: pathname.includes("/appointments"),
        },
        {
          name: "Clientes",
          href: `/dashboard/${tenantId}/clients`,
          icon: Users,
          current: pathname.includes("/clients"),
        },
        {
          name: "Barbeiros",
          href: `/dashboard/${tenantId}/barbers`,
          icon: Scissors,
          current: pathname.includes("/barbers"),
        },
        {
          name: "Serviços",
          href: `/dashboard/${tenantId}/services`,
          icon: List,
          current: pathname.includes("/services"),
        },
        {
          name: "WhatsApp",
          href: `/dashboard/${tenantId}/whatsapp`,
          icon: MessageSquare,
          current: pathname.includes("/whatsapp"),
        },
        {
          name: "Configurações",
          href: `/dashboard/${tenantId}/settings`,
          icon: Settings,
          current: pathname.includes("/settings"),
        },
      ]
    : []

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative flex flex-col w-64 h-full bg-black text-white">
          <div className="flex items-center justify-center h-16 border-b border-gray-800">
            <h2 className="text-xl font-bold">AgendAI Barber</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(item.current ? "text-white" : "text-gray-400 group-hover:text-white", "mr-3 h-6 w-6")}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-black text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <h2 className="text-xl font-bold">AgendAI Barber</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  item.current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                )}
              >
                <item.icon
                  className={cn(item.current ? "text-white" : "text-gray-400 group-hover:text-white", "mr-3 h-5 w-5")}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
