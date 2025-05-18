import Link from "next/link"
import Image from "next/image"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/">
            <Image src="/logo.svg" alt="AgendAI Barber" width={180} height={48} className="h-12 w-auto" priority />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Redefinir senha</h1>
          <p className="text-center text-sm text-gray-500">Crie uma nova senha para sua conta</p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
