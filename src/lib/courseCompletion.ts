import { supabase } from '@/lib/supabase'

export interface CourseCompletionData {
  courseId: string
  userId: string
  completedAt: string
  progress: number
}

export class CourseCompletionService {
  private static client = supabase

  /**
   * Marca un curso como completado
   */
  static async completeCourse(courseId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar si ya existe una inscripción
      const { data: existingEnrollment, error: checkError } = await this.client
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingEnrollment) {
        // Actualizar inscripción existente
        const { error: updateError } = await this.client
          .from('enrollments')
          .update({
            completed_at: new Date().toISOString(),
            progress: 100
          })
          .eq('user_id', userId)
          .eq('course_id', courseId)

        if (updateError) throw updateError
      } else {
        // Crear nueva inscripción completada
        const { error: insertError } = await this.client
          .from('enrollments')
          .insert({
            user_id: userId,
            course_id: courseId,
            completed_at: new Date().toISOString(),
            progress: 100
          })

        if (insertError) throw insertError
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error completing course:', error)
      return { 
        success: false, 
        error: error.message || 'Error al completar el curso' 
      }
    }
  }

  /**
   * Verifica si un curso está completado
   */
  static async isCourseCompleted(courseId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('enrollments')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking course completion:', error)
        return false
      }

      return data?.completed_at ? true : false
    } catch (error) {
      console.error('Error checking course completion:', error)
      return false
    }
  }

  /**
   * Obtiene todos los cursos completados por un usuario
   */
  static async getCompletedCourses(userId: string): Promise<CourseCompletionData[]> {
    try {
      const { data, error } = await this.client
        .from('enrollments')
        .select(`
          course_id,
          user_id,
          completed_at,
          progress,
          courses (
            title,
            description,
            instructor_id
          )
        `)
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })

      if (error) throw error

      return data?.map((item: any) => ({
        courseId: item.course_id,
        userId: item.user_id,
        completedAt: item.completed_at,
        progress: item.progress
      })) || []
    } catch (error) {
      console.error('Error getting completed courses:', error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de completado de cursos
   */
  static async getCourseCompletionStats(userId: string): Promise<{
    totalCompleted: number;
    totalEnrolled: number;
    completionRate: number;
  }> {
    try {
      const { data: enrollments, error } = await this.client
        .from('enrollments')
        .select('completed_at')
        .eq('user_id', userId)

      if (error) throw error

      const totalEnrolled = enrollments?.length || 0
      const totalCompleted = enrollments?.filter((e: any) => e.completed_at).length || 0
      const completionRate = totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0

      return {
        totalCompleted,
        totalEnrolled,
        completionRate: Math.round(completionRate)
      }
    } catch (error) {
      console.error('Error getting completion stats:', error)
      return {
        totalCompleted: 0,
        totalEnrolled: 0,
        completionRate: 0
      }
    }
  }
}
