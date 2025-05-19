"use client"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 bg-white shadow-md p-8 rounded-lg">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800">Entrar na sua conta</h1>
        <LoginForm />
      </div>
    </main>
  )
}
