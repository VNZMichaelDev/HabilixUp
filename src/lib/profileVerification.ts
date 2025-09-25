import { createClientSupabaseClient } from './supabaseClient'

export interface PublicProfile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  verification_code: string
  is_public: boolean
  created_at: string
  completedCourses: Array<{
    id: string
    title: string
    description: string
    instructor_name: string
    category_name: string
    completed_at: string
    certificate_url?: string
  }>
  studyStats: {
    totalCourses: number
    totalHours: number
    certificatesEarned: number
  }
}

export class ProfileVerificationService {
  private supabase = createClientSupabaseClient()

  // Generar código de verificación único para un usuario
  async generateVerificationCode(userId: string): Promise<string> {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido')
      }

      let attempts = 0
      const maxAttempts = 5

      while (attempts < maxAttempts) {
        // Generar código único de 8 caracteres
        const code = this.generateUniqueCode()
        
        // Verificar que no exista ya
        const { data: existing, error: checkError } = await this.supabase
          .from('profiles')
          .select('verification_code')
          .eq('verification_code', code)
          .maybeSingle()

        if (checkError) {
          console.warn('Error checking existing code:', checkError)
        }

        if (!existing) {
          // El código es único, actualizar el perfil
          const { error: updateError } = await this.supabase
            .from('profiles')
            .update({ 
              verification_code: code,
              is_public: true 
            })
            .eq('id', userId)

          if (updateError) {
            throw new Error(`Error actualizando perfil: ${updateError.message}`)
          }

          return code
        }

        attempts++
      }

      throw new Error('No se pudo generar un código único después de varios intentos')
    } catch (error) {
      const code = (error as any)?.code
      if (code === '42703') {
        console.error('Error generating verification code: missing column verification_code/is_public in profiles. Run the DB migration to add these columns.')
        throw new Error('Falta actualizar la base de datos: agrega las columnas verification_code e is_public en la tabla profiles (ver database-fixed.sql).')
      }
      console.error('Error generating verification code:', error)
      throw error instanceof Error ? error : new Error('Error desconocido generando código de verificación')
    }
  }

  // Obtener perfil público por código de verificación
  async getPublicProfile(verificationCode: string): Promise<PublicProfile | null> {
    try {
      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('verification_code', verificationCode)
        .eq('is_public', true)
        .single()

      if (profileError || !profile) {
        return null
      }

      // Obtener cursos completados
      const { data: enrollments, error: enrollmentsError } = await this.supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          completed_at,
          courses (
            id,
            title,
            description,
            profiles (
              full_name
            ),
            categories (
              name
            )
          )
        `)
        .eq('user_id', profile.id)
        .eq('progress', 100)

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError)
      }

      const completedCourses = enrollments?.map((enrollment: any) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        instructor_name: enrollment.courses.profiles?.full_name || 'Instructor',
        category_name: enrollment.courses.categories?.name || 'General',
        completed_at: enrollment.completed_at || enrollment.created_at,
        certificate_url: `/certificado/${enrollment.courses.id}?verify=${verificationCode}`
      })) || []

      // Calcular estadísticas de estudio
      const { data: allProgress } = await this.supabase
        .from('lesson_progress')
        .select(`
          watch_time,
          lessons (
            duration
          )
        `)
        .eq('user_id', profile.id)

      let totalMinutes = 0
      allProgress?.forEach((progress: any) => {
        if (progress.watch_time > 0) {
          totalMinutes += Math.round(progress.watch_time / 60)
        } else if (progress.lessons?.duration) {
          totalMinutes += progress.lessons.duration
        }
      })

      const publicProfile: PublicProfile = {
        id: profile.id,
        full_name: profile.full_name || 'Usuario de HabilixUp',
        email: profile.email,
        avatar_url: profile.avatar_url,
        verification_code: profile.verification_code,
        is_public: profile.is_public,
        created_at: profile.created_at,
        completedCourses,
        studyStats: {
          totalCourses: completedCourses.length,
          totalHours: Math.round(totalMinutes / 60),
          certificatesEarned: completedCourses.length
        }
      }

      return publicProfile
    } catch (error) {
      console.error('Error getting public profile:', error)
      return null
    }
  }

  // Obtener o crear código de verificación para el usuario actual
  async getOrCreateVerificationCode(userId: string): Promise<string> {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido')
      }

      // Verificar si ya tiene código
      const { data: profile, error: selectError } = await this.supabase
        .from('profiles')
        .select('verification_code')
        .eq('id', userId)
        .maybeSingle()

      if (selectError) {
        console.warn('Error obteniendo perfil:', selectError)
      }

      if (profile?.verification_code) {
        return profile.verification_code
      }

      // Si no tiene, generar uno nuevo
      return await this.generateVerificationCode(userId)
    } catch (error) {
      const code = (error as any)?.code
      if (code === '42703') {
        console.error('Error getting verification code: missing column verification_code in profiles. Run the DB migration to add it.')
        throw new Error('Falta actualizar la base de datos: agrega las columnas verification_code e is_public en profiles (ver database-fixed.sql).')
      }
      console.error('Error getting verification code:', error)
      throw error instanceof Error ? error : new Error('Error obteniendo código de verificación')
    }
  }

  // Alternar visibilidad pública del perfil
  async togglePublicVisibility(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido')
      }

      const { data: profile, error: selectError } = await this.supabase
        .from('profiles')
        .select('is_public')
        .eq('id', userId)
        .single()

      if (selectError) {
        throw new Error(`Error al obtener perfil: ${selectError.message}`)
      }

      const newVisibility = !profile?.is_public

      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ is_public: newVisibility })
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Error al actualizar visibilidad: ${updateError.message}`)
      }

      return newVisibility
    } catch (error) {
      console.error('Error toggling public visibility:', error)
      throw error instanceof Error ? error : new Error('Error desconocido al cambiar visibilidad')
    }
  }

  // Generar código único de 8 caracteres
  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generar URL pública del perfil
  static getPublicProfileUrl(verificationCode: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/perfil/${verificationCode}`
    }
    return `/perfil/${verificationCode}`
  }

  // Generar URL pública del CV
  static getPublicCVUrl(verificationCode: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/cv/${verificationCode}`
    }
    return `/cv/${verificationCode}`
  }
}

export const profileVerificationService = new ProfileVerificationService()
