import { createClientSupabaseClient } from '@/lib/supabaseClient'

export const ADMIN_EMAIL = 'maikermicha15@gmail.com'

export class AdminAuthService {
  /**
   * Verifica si un usuario es administrador
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      console.log('AdminAuthService: Checking admin for userId:', userId)
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('id', userId)
        .single()

      console.log('AdminAuthService: Query result:', { data, error })

      if (error || !data) {
        console.log('AdminAuthService: No data or error found')
        return false
      }

      // Verificar si es el email admin específico o tiene rol admin
      const isAdminEmail = data.email === ADMIN_EMAIL
      const hasAdminRole = data.role === 'admin'
      const result = isAdminEmail || hasAdminRole
      
      console.log('AdminAuthService: Admin check result:', {
        email: data.email,
        role: data.role,
        isAdminEmail,
        hasAdminRole,
        finalResult: result
      })
      
      return result
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  /**
   * Verifica si un email es de administrador
   */
  static isAdminEmail(email: string): boolean {
    return email === ADMIN_EMAIL
  }

  /**
   * Actualiza el rol de un usuario a admin (solo para el email específico)
   */
  static async promoteToAdmin(userId: string, email: string): Promise<boolean> {
    try {
      if (!this.isAdminEmail(email)) {
        return false
      }

      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .eq('email', email)

      return !error
    } catch (error) {
      console.error('Error promoting to admin:', error)
      return false
    }
  }

  /**
   * Middleware para proteger rutas de admin
   */
  static async requireAdmin(userId: string): Promise<{ isAdmin: boolean; error?: string }> {
    try {
      const isAdmin = await this.isAdmin(userId)
      
      if (!isAdmin) {
        return {
          isAdmin: false,
          error: 'Acceso denegado. Se requieren permisos de administrador.'
        }
      }

      return { isAdmin: true }
    } catch (error) {
      return {
        isAdmin: false,
        error: 'Error al verificar permisos de administrador.'
      }
    }
  }
}
