'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { studyTimeService } from '@/lib/studyTime'
import { quizService } from '@/lib/quiz'
import QuizRenderer from '../../../../../components/QuizRenderer'

interface Lesson {
  id: string
  title: string
  description: string | null
  content: string | null
  duration: number | null
  order_index: number
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClientSupabaseClient()

  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courseTitle, setCourseTitle] = useState<string>('Curso')
  const [loadingData, setLoadingData] = useState(true)
  const [marking, setMarking] = useState(false)
  const [quizId, setQuizId] = useState<string | null>(null)
  const [quizRequired, setQuizRequired] = useState(false)
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null)

  const lessonIndex = useMemo(() => lessons.findIndex(l => l.id === lessonId), [lessons, lessonId])
  const lesson = lessonIndex >= 0 ? lessons[lessonIndex] : null
  const prev = lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined
  const next = lessonIndex >= 0 && lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : undefined

  const ensureEnrollment = useCallback(async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (!data) {
      await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId, progress: 0 })
    }
  }, [supabase, user, courseId])

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true)
      if (!courseId || !lessonId) return

      // Obtener curso
      const { data: course } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .maybeSingle()

      if (course?.title) setCourseTitle(course.title)

      // Obtener todas las lecciones del curso ordenadas
      const { data: lessonList } = await supabase
        .from('lessons')
        .select('id, title, description, content, duration, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      setLessons(lessonList || [])

      // Asegurar inscripción
      await ensureEnrollment()

      // Cargar quiz de la lección (si existe)
      const quiz = await quizService.getLessonQuiz(lessonId)
      if (quiz) {
        setQuizId(quiz.id)
        setQuizRequired(!!quiz.required_to_continue)
        if (user?.id) {
          const last = await quizService.getLastQuizAttempt(user.id, quiz.id)
          setQuizPassed(last?.passed ?? false)
        }
      } else {
        setQuizId(null)
        setQuizRequired(false)
        setQuizPassed(true) // no hay quiz -> permitir avanzar
      }
    } finally {
      setLoadingData(false)
    }
  }, [courseId, lessonId, supabase, ensureEnrollment, user?.id])

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/cursos/${courseId}/leccion/${lessonId}`)
      return
    }
    if (user) {
      loadData()
    }
  }, [user, loading, router, courseId, lessonId, loadData])

  const handleMarkCompleted = async () => {
    if (!user?.id || !lesson) return
    if (quizRequired && !quizPassed) return
    setMarking(true)
    try {
      await studyTimeService.markLessonCompleted(user.id, lesson.id)
      if (next) {
        router.push(`/cursos/${courseId}/leccion/${next.id}`)
      } else {
        // Si hay examen final requerido, ir al examen; si no, al certificado
        const exam = await quizService.getCourseExam(courseId)
        if (exam?.required_for_certificate) {
          router.push(`/cursos/${courseId}/examen`)
        } else {
          router.push(`/certificado/${courseId}`)
        }
      }
    } finally {
      setMarking(false)
    }
  }

  if (loading || loadingData) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lección...</p>
        </div>
      </main>
    )
  }

  if (!lesson) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lección no encontrada.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header compartido */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-500 truncate">Inicio</Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/cursos" className="text-gray-400 hover:text-gray-500 truncate">Cursos</Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href={`/cursos/${courseId}`} className="text-gray-400 hover:text-gray-500">{courseTitle}</Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-600">{lesson.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-primary-600 font-semibold">{courseTitle}</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Lección {lessonIndex + 1} de {lessons.length}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              {typeof lesson.duration === 'number' && (
                <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Duración estimada: {lesson.duration} min</div>
              )}
              {lesson.description && (
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>{lesson.description}</p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
                <div 
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
                />
              </div>

              {/* Quiz de la lección (si existe) */}
              {quizId && (
                <div className="mt-4 sm:mt-6">
                  <QuizRenderer
                    quizId={quizId}
                    onPassed={() => setQuizPassed(true)}
                    onAttempt={(res: { score: number; passed: boolean }) => setQuizPassed(res.passed)}
                  />
                </div>
              )}

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleMarkCompleted}
                  disabled={marking || (quizRequired && !quizPassed)}
                  className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-300 disabled:opacity-60"
                >
                  {marking
                    ? 'Guardando…'
                    : quizRequired && !quizPassed
                      ? 'Debes aprobar el quiz para continuar'
                      : (next ? 'Marcar como completada y continuar →' : 'Marcar como completada y ver certificado')}
                </button>
              </div>
            </div>

            {/* Navegación entre lecciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              {prev ? (
                <Link
                  href={`/cursos/${courseId}/leccion/${prev.id}`}
                  className="flex-1 text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition duration-300"
                >
                  ← Lección anterior
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {next ? (
                <Link
                  href={`/cursos/${courseId}/leccion/${next.id}`}
                  className="flex-1 text-center bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition duration-300"
                >
                  Siguiente lección →
                </Link>
              ) : (
                <Link
                  href={`/cursos/${courseId}`}
                  className="flex-1 text-center bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition duration-300"
                >
                  Volver al curso
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar con temario */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Contenido del curso</h2>
              <div className="space-y-2">
                {lessons.map((l, i) => {
                  const active = l.id === lesson.id
                  return (
                    <Link
                      key={l.id}
                      href={`/cursos/${courseId}/leccion/${l.id}`}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition ${
                        active
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                          active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className={`truncate text-sm sm:text-base ${active ? 'text-primary-700 font-semibold' : 'text-gray-800 font-medium'}`}>{l.title}</div>
                          {typeof l.duration === 'number' && (
                            <div className="text-[11px] sm:text-xs text-gray-500 truncate">{l.duration} min</div>
                          )}
                        </div>
                      </div>
                      <svg className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
