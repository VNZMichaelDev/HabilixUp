// Tipos generados basados en el esquema de la base de datos
// Estos tipos coinciden exactamente con las tablas de Supabase

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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
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
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          created_at?: string
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
        Insert: {
          id?: string
          title: string
          description: string
          short_description?: string | null
          instructor_id?: string | null
          category_id?: string | null
          price?: number
          duration?: string | null
          level?: 'Principiante' | 'Intermedio' | 'Avanzado' | null
          image_url?: string | null
          video_preview_url?: string | null
          is_published?: boolean
          rating?: number
          students_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          short_description?: string | null
          instructor_id?: string | null
          category_id?: string | null
          price?: number
          duration?: string | null
          level?: 'Principiante' | 'Intermedio' | 'Avanzado' | null
          image_url?: string | null
          video_preview_url?: string | null
          is_published?: boolean
          rating?: number
          students_count?: number
          created_at?: string
          updated_at?: string
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
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          completed_at?: string | null
          progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          completed_at?: string | null
          progress?: number
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
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content?: string | null
          video_url?: string | null
          duration?: number | null
          order_index: number
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: string | null
          video_url?: string | null
          duration?: number | null
          order_index?: number
          is_free?: boolean
          created_at?: string
          updated_at?: string
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
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
          watch_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          watch_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          course_id: string
          rating: number | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia para usar en el código
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Course = Database['public']['Tables']['courses']['Row']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']

export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert']
export type EnrollmentUpdate = Database['public']['Tables']['enrollments']['Update']

export type Lesson = Database['public']['Tables']['lessons']['Row']
export type LessonInsert = Database['public']['Tables']['lessons']['Insert']
export type LessonUpdate = Database['public']['Tables']['lessons']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
