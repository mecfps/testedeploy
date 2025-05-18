import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "./supabase-config"

// Criando cliente para o lado do servidor
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Singleton para o cliente do lado do cliente
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseInstance) return clientSupabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
  return clientSupabaseInstance
}

// Alias para compatibilidade com código existente
export const createClientComponentClient = createClientSupabaseClient
