import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso en componentes del cliente (SDK puro). Evita usar este export para auth en React,
// mantenemos la compatibilidad pero no lo importes en nuevas partes del código.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para componentes del servidor
export const createServerSupabaseClient = () => {
  const { cookies } = require('next/headers')
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Cliente para componentes del cliente (hooks, etc.) como singleton para evitar múltiples GoTrueClient
let browserClient: ReturnType<typeof createClientComponentClient> | null = null
export const createClientSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createClientComponentClient()
  }
  return browserClient
}

// Tipos de la base de datos
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'instructor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          created_at: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          short_description: string | null
          instructor_id: string | null
          category_id: string | null
          price: number
          duration: string | null
          level: 'Principiante' | 'Intermedio' | 'Avanzado' | null
          image_url: string | null
          video_preview_url: string | null
          is_published: boolean
          rating: number
          students_count: number
          created_at: string
          updated_at: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: string | null
          video_url: string | null
          duration: number | null
          order_index: number
          is_free: boolean
          created_at: string
          updated_at: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
          progress: number
        }
        Insert: {
          user_id: string
          course_id: string
        }
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          watch_time: number
          created_at: string
          updated_at: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          course_id: string
          rating: number
          comment: string | null
          created_at: string
        }
      }
    }
  }
}
