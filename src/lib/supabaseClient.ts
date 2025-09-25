import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton del cliente para componentes del cliente (React hooks, etc.)
let browserClient: ReturnType<typeof createClientComponentClient<Database>> | null = null
export const createClientSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createClientComponentClient<Database>()
  }
  return browserClient
}
