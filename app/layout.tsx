import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { DebugScript } from "./debug-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgendAI Barber",
  description: "Sistema de agendamento para barbearias",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
        <DebugScript />
      </body>
    </html>
  )
}
