import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Este archivo es SOLO para uso en componentes del servidor / rutas
export const createServerSupabaseClient = () => {
  const { cookies } = require('next/headers')
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
