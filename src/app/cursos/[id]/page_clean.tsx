'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

interface CoursePageProps {
  params: {
    id: string
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const redirectToFirstLesson = async () => {
      try {
        const { data: firstLesson } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', params.id)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (firstLesson?.id) {
          router.push(`/cursos/${params.id}/leccion/${firstLesson.id}`)
        } else {
          router.push(`/cursos/${params.id}`)
        }
      } catch {
        router.push(`/cursos/${params.id}`)
      }
    }

    redirectToFirstLesson()
  }, [params.id, router, supabase])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}
