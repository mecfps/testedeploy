import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-8 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Image src="/logo.svg" alt="AgendAI Barber" width={180} height={48} className="h-12 w-auto" priority />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bem-vindo de volta</h1>
            <p className="text-center text-sm text-gray-500">Entre com suas credenciais para acessar sua conta</p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden bg-black md:flex md:w-1/2 md:items-center md:justify-center">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <h2 className="mb-6 text-3xl font-bold">AgendAI Barber</h2>
            <p className="mb-8 text-center text-lg">Gerencie sua barbearia com inteligência e eficiência</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="rounded-full border border-white/30 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <span className="text-sm">Agendamentos</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="rounded-full border border-white/30 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-sm">Clientes</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="rounded-full border border-white/30 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <span className="text-sm">Análises</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="rounded-full border border-white/30 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
                    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                    <path d="M16 11h0" />
                  </svg>
                </div>
                <span className="text-sm">Serviços</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
