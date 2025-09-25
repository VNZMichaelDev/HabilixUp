import { createClientSupabaseClient } from './supabaseClient'
import { User } from '@supabase/supabase-js'
import { ProfileUpdate, EnrollmentInsert } from '@/types/database'

export interface AuthUser extends User {
  profile?: {
    full_name: string | null
    avatar_url: string | null
    role: 'student' | 'instructor' | 'admin'
  }
}

export class AuthService {
  private supabase = createClientSupabaseClient()

  // Registrar nuevo usuario
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    return data
  }

  // Iniciar sesión
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  // Cerrar sesión
  async signOut() {
    try {
      console.log('Iniciando cierre de sesión...')
      
      // Llamar a signOut de Supabase
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        console.error('Error en Supabase signOut:', error)
        throw new Error(`Error al cerrar sesión: ${error.message}`)
      }
      
      console.log('Cierre de sesión exitoso')
      
      // Limpiar cualquier dato local si es necesario
      if (typeof window !== 'undefined') {
        // Limpiar localStorage si hay datos de sesión
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
      }
      
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error)
      throw error
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) return null

    // Obtener perfil del usuario
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile: profile || undefined
    }
  }

  // Obtener sesión actual
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  // Actualizar perfil
  async updateProfile(updates: ProfileUpdate) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('No user logged in')

    const { error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
  }

  // Verificar si el usuario está inscrito en un curso
  async isEnrolledInCourse(courseId: string): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    const { data } = await this.supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    return !!data
  }

  // Inscribirse en un curso
  async enrollInCourse(courseId: string) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('No user logged in')

    const enrollmentData: EnrollmentInsert = {
      user_id: user.id,
      course_id: courseId,
      progress: 0
    }

    const { error } = await this.supabase
      .from('enrollments')
      .insert(enrollmentData)

    if (error) throw error
  }
}

export const authService = new AuthService()
