import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

// Função para criar cliente no lado do servidor com cookies
// Esta função só deve ser importada em Server Components
export const createServerComponentSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
