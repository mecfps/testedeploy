import Link from "next/link"
import Image from "next/image"
import { SignUpForm } from "@/components/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/">
            <Image src="/logo.svg" alt="AgendAI Barber" width={180} height={48} className="h-12 w-auto" priority />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Criar sua conta</h1>
          <p className="text-center text-sm text-gray-500">Preencha os dados abaixo para criar sua conta</p>
        </div>

        <SignUpForm />

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link href="/" className="font-medium text-black hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
