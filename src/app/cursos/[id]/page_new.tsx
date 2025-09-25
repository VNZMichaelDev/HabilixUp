'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CoursePageProps {
  params: {
    id: string
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirigir inmediatamente al curso específico
    router.push(`/cursos/${params.id}/leccion/1`)
  }, [params.id, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}
