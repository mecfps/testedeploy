import type { ReactNode } from "react"
import { TenantProvider } from "@/contexts/tenant-context"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </TenantProvider>
  )
}
