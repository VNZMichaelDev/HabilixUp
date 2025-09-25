'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { quizService } from '@/lib/quiz'
import ExamRenderer from '@/components/ExamRenderer'
import Link from 'next/link'

export default function CourseExamPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const courseId = params.id as string

  const [examId, setExamId] = useState<string | null>(null)
  const [passScore, setPassScore] = useState(70)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoadingData(true)
        const exam = await quizService.getCourseExam(courseId)
        if (!exam) {
          router.push(`/cursos/${courseId}`)
          return
        }
        setExamId(exam.id)
        setPassScore(exam.pass_score || 70)
      } finally {
        setLoadingData(false)
      }
    }
    if (!loading && user) load()
  }, [user, loading, courseId, router])

  if (loading || loadingData) return <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Cargando...</div>
  if (!user) {
    router.push(`/login?redirect=/cursos/${courseId}/examen`)
    return null
  }
  if (!examId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-2">Este curso no tiene examen final</h1>
        <Link href={`/certificado/${courseId}`} className="text-primary-600 hover:underline">Ir al certificado</Link>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Examen Final</h1>
        <p className="text-gray-600">Responde las preguntas para obtener tu certificado.</p>
      </div>

      <ExamRenderer
        examId={examId}
        passScore={passScore}
        onPassed={() => router.push(`/certificado/${courseId}`)}
      />

      <div className="mt-6">
        <Link href={`/cursos/${courseId}`} className="text-gray-600 hover:underline">Volver al curso</Link>
      </div>
    </main>
  )
}
