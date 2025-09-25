import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { AdminAuthService } from './adminAuth'

export interface AdminCourse {
  id: string
  title: string
  description: string
  short_description?: string
  instructor_id?: string
  category_id?: string
  price: number
  duration?: string
  level?: 'Principiante' | 'Intermedio' | 'Avanzado'
  image_url?: string
  video_preview_url?: string
  is_published: boolean
  rating: number
  students_count: number
  created_at: string
  updated_at: string
}

export interface AdminLesson {
  id: string
  course_id: string
  title: string
  description?: string
  content?: string
  video_url?: string
  duration?: number
  order_index: number
  is_free: boolean
  created_at: string
  updated_at: string
}

export interface CreateCourseData {
  title: string
  description: string
  short_description?: string
  category_id?: string
  price: number
  duration?: string
  level?: 'Principiante' | 'Intermedio' | 'Avanzado'
  image_url?: string
  video_preview_url?: string
  is_published?: boolean
}

export interface CreateLessonData {
  course_id: string
  title: string
  description?: string
  content?: string
  video_url?: string
  duration?: number
  order_index: number
  is_free?: boolean
}

export class AdminCourseService {
  /**
   * Obtiene todos los cursos (admin)
   */
  static async getAllCourses(userId: string): Promise<{ success: boolean; data?: AdminCourse[]; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          categories (
            name,
            slug
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data: data as AdminCourse[] }
    } catch (error: any) {
      console.error('Error fetching courses:', error)
      return { success: false, error: error.message || 'Error al obtener cursos' }
    }
  }

  /**
   * Crea un nuevo curso
   */
  static async createCourse(userId: string, courseData: CreateCourseData): Promise<{ success: boolean; data?: AdminCourse; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      // Sanitizar campos opcionales: convertir "" a null y asegurar tipos
      const payload: any = {
        ...courseData,
        instructor_id: userId,
        is_published: courseData.is_published || false,
        rating: 0,
        students_count: 0,
      }
      if (!courseData.category_id) payload.category_id = null
      if (!courseData.image_url) payload.image_url = null
      if (!courseData.video_preview_url) payload.video_preview_url = null
      if (!courseData.duration) payload.duration = null
      // Asegurar número en price
      payload.price = Number.isFinite(courseData.price as any) ? courseData.price : 0

      const { data, error } = await supabase
        .from('courses')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      return { success: true, data: data as AdminCourse }
    } catch (error: any) {
      console.error('Error creating course:', error)
      return { success: false, error: error.message || 'Error al crear curso' }
    }
  }

  /**
   * Actualiza un curso
   */
  static async updateCourse(userId: string, courseId: string, courseData: Partial<CreateCourseData>): Promise<{ success: boolean; data?: AdminCourse; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      // Sanitizar: convertir strings vacíos a null para columnas UUID/URL/text opcionales
      const patch: any = { ...courseData }
      if (patch.category_id === '') patch.category_id = null
      if (patch.image_url === '') patch.image_url = null
      if (patch.video_preview_url === '') patch.video_preview_url = null
      if (patch.duration === '') patch.duration = null
      if (typeof patch.price !== 'undefined') patch.price = Number(patch.price) || 0

      const { data, error } = await supabase
        .from('courses')
        .update(patch)
        .eq('id', courseId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data: data as AdminCourse }
    } catch (error: any) {
      console.error('Error updating course:', error)
      return { success: false, error: error.message || 'Error al actualizar curso' }
    }
  }

  /**
   * Elimina un curso
   */
  static async deleteCourse(userId: string, courseId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting course:', error)
      return { success: false, error: error.message || 'Error al eliminar curso' }
    }
  }

  /**
   * Obtiene las lecciones de un curso
   */
  static async getCourseLessons(userId: string, courseId: string): Promise<{ success: boolean; data?: AdminLesson[]; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      if (error) throw error

      return { success: true, data: data as AdminLesson[] }
    } catch (error: any) {
      console.error('Error fetching lessons:', error)
      return { success: false, error: error.message || 'Error al obtener lecciones' }
    }
  }

  /**
   * Crea una nueva lección
   */
  static async createLesson(userId: string, lessonData: CreateLessonData): Promise<{ success: boolean; data?: AdminLesson; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          ...lessonData,
          is_free: lessonData.is_free || false
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data: data as AdminLesson }
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      return { success: false, error: error.message || 'Error al crear lección' }
    }
  }

  /**
   * Actualiza una lección
   */
  static async updateLesson(userId: string, lessonId: string, lessonData: Partial<CreateLessonData>): Promise<{ success: boolean; data?: AdminLesson; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', lessonId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data: data as AdminLesson }
    } catch (error: any) {
      console.error('Error updating lesson:', error)
      return { success: false, error: error.message || 'Error al actualizar lección' }
    }
  }

  /**
   * Elimina una lección
   */
  static async deleteLesson(userId: string, lessonId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      return { success: false, error: error.message || 'Error al eliminar lección' }
    }
  }

  /**
   * Obtiene todas las categorías
   */
  static async getCategories(userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      return { success: false, error: error.message || 'Error al obtener categorías' }
    }
  }

  /**
   * Publica/despublica un curso
   */
  static async toggleCoursePublication(userId: string, courseId: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const adminCheck = await AdminAuthService.requireAdmin(userId)
      if (!adminCheck.isAdmin) {
        return { success: false, error: adminCheck.error }
      }

      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('courses')
        .update({ is_published: isPublished })
        .eq('id', courseId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error toggling course publication:', error)
      return { success: false, error: error.message || 'Error al cambiar estado de publicación' }
    }
  }
}
