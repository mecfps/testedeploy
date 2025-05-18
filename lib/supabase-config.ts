export const supabaseConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    flowType: "pkce",
    debug: true,
    cookieOptions: {
      name: "sb-auth-token",
      lifetime: 60 * 60 * 24 * 7, // 7 dias
      domain: typeof window !== "undefined" ? window.location.hostname : undefined,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
}
