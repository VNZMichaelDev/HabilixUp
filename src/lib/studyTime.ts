import { createClientSupabaseClient } from './supabaseClient'

export interface StudyTimeData {
  totalMinutes: number
  thisWeekMinutes: number
  todayMinutes: number
  averagePerDay: number
}

export class StudyTimeService {
  private supabase = createClientSupabaseClient()

  // Calcular tiempo total de estudio del usuario
  async getUserStudyTime(userId: string): Promise<StudyTimeData> {
    try {
      // Obtener todo el progreso de lecciones del usuario
      const { data: lessonProgress, error } = await this.supabase
        .from('lesson_progress')
        .select(`
          watch_time,
          completed_at,
          created_at,
          lessons (
            duration
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      let totalMinutes = 0
      let thisWeekMinutes = 0
      let todayMinutes = 0

      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Domingo
      startOfWeek.setHours(0, 0, 0, 0)

      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)

      lessonProgress?.forEach((progress: any) => {
        // Usar watch_time si está disponible, sino usar la duración de la lección si está completada
        let minutes = 0
        
        if (progress.watch_time > 0) {
          minutes = Math.round(progress.watch_time / 60) // Convertir segundos a minutos
        } else if (progress.completed_at && progress.lessons?.duration) {
          minutes = progress.lessons.duration // Duración en minutos
        }

        totalMinutes += minutes

        // Calcular tiempo de esta semana
        const completedDate = new Date(progress.completed_at || progress.created_at)
        if (completedDate >= startOfWeek) {
          thisWeekMinutes += minutes
        }

        // Calcular tiempo de hoy
        if (completedDate >= startOfDay) {
          todayMinutes += minutes
        }
      })

      // Calcular promedio por día (últimos 30 días)
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(now.getDate() - 30)

      const recentProgress = lessonProgress?.filter((progress: any) => {
        const date = new Date(progress.completed_at || progress.created_at)
        return date >= thirtyDaysAgo
      })

      let recentMinutes = 0
      recentProgress?.forEach((progress: any) => {
        if (progress.watch_time > 0) {
          recentMinutes += Math.round(progress.watch_time / 60)
        } else if (progress.completed_at && progress.lessons?.duration) {
          recentMinutes += progress.lessons.duration
        }
      })

      const averagePerDay = Math.round(recentMinutes / 30)

      return {
        totalMinutes,
        thisWeekMinutes,
        todayMinutes,
        averagePerDay
      }
    } catch (error) {
      console.error('Error calculating study time:', error)
      return {
        totalMinutes: 0,
        thisWeekMinutes: 0,
        todayMinutes: 0,
        averagePerDay: 0
      }
    }
  }

  // Registrar tiempo de visualización de una lección
  async updateWatchTime(userId: string, lessonId: string, watchTimeSeconds: number) {
    try {
      const { error } = await this.supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          watch_time: watchTimeSeconds,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating watch time:', error)
    }
  }

  // Marcar lección como completada
  async markLessonCompleted(userId: string, lessonId: string) {
    try {
      const { error } = await this.supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })

      if (error) throw error

      // Actualizar progreso del curso
      await this.updateCourseProgress(userId, lessonId)
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
    }
  }

  // Actualizar progreso del curso basado en lecciones completadas
  private async updateCourseProgress(userId: string, lessonId: string) {
    try {
      // Obtener el curso de esta lección
      const { data: lesson, error: lessonErr } = await this.supabase
        .from('lessons')
        .select('course_id')
        .eq('id', lessonId)
        .single()

      if (lessonErr) {
        console.error('[Progress] Error getting lesson course_id:', lessonErr)
        return
      }
      if (!lesson) {
        console.warn('[Progress] Lesson not found for id:', lessonId)
        return
      }

      // Obtener total de lecciones del curso
      const { data: totalLessons, error: totalErr } = await this.supabase
        .from('lessons')
        .select('id')
        .eq('course_id', lesson.course_id)

      if (totalErr) {
        console.error('[Progress] Error fetching total lessons:', totalErr)
        return
      }
      if (!totalLessons || totalLessons.length === 0) {
        console.warn('[Progress] Course has no lessons. course_id:', lesson.course_id)
        return
      }

      // Obtener lecciones completadas por el usuario
      const lessonIds = totalLessons.map(l => l.id)
      const { data: completedLessons, error: completedErr } = await this.supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('completed', true)
        .in('lesson_id', lessonIds)

      if (completedErr) {
        console.error('[Progress] Error fetching completed lessons:', completedErr)
        return
      }

      if (completedLessons) {
        let progress = Math.round((completedLessons.length / totalLessons.length) * 100)
        // Asegurar 0-100
        progress = Math.max(0, Math.min(100, progress))
        console.info('[Progress] Calculated', { completed: completedLessons.length, total: totalLessons.length, progress })

        // Actualizar progreso en la tabla enrollments
        const { error } = await this.supabase
          .from('enrollments')
          .update({ 
            progress,
            completed_at: progress === 100 ? new Date().toISOString() : null
          })
          .eq('user_id', userId)
          .eq('course_id', lesson.course_id)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating course progress:', error)
    }
  }

  // Formatear minutos a texto legible
  static formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    
    return `${hours}h ${remainingMinutes}m`
  }

  // Formatear tiempo para mostrar en dashboard
  static formatStudyTime(studyTimeData: StudyTimeData) {
    return {
      total: this.formatMinutes(studyTimeData.totalMinutes),
      thisWeek: this.formatMinutes(studyTimeData.thisWeekMinutes),
      today: this.formatMinutes(studyTimeData.todayMinutes),
      averagePerDay: this.formatMinutes(studyTimeData.averagePerDay)
    }
  }
}

export const studyTimeService = new StudyTimeService()
