'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OldCoursePage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirigir de /cursos/[id] a /curso/[id]
    if (params.id) {
      router.replace(`/curso/${params.id}`)
    }
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
