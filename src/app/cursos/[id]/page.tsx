'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

export default function CoursePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const doRedirect = async () => {
      const id = params.id as string
      if (!id) return

      try {
        const { data: firstLesson } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', id)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (firstLesson?.id) {
          router.replace(`/cursos/${id}/leccion/${firstLesson.id}`)
        } else {
          router.replace(`/cursos/${id}`)
        }
      } catch (e) {
        console.error('Redirect error (course first lesson):', e)
        router.replace(`/cursos/${id}`)
      }
    }

    doRedirect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}
         