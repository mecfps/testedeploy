import Link from "next/link"
import Image from "next/image"
import { PasswordRecoveryForm } from "@/components/password-recovery-form"

export default function PasswordRecoveryPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/">
            <Image src="/logo.svg" alt="AgendAI Barber" width={180} height={48} className="h-12 w-auto" priority />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recuperar senha</h1>
          <p className="text-center text-sm text-gray-500">
            Informe seu e-mail para receber um link de redefinição de senha
          </p>
        </div>

        <PasswordRecoveryForm />

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-black">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
