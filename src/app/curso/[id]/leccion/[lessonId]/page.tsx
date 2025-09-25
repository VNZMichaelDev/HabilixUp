'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { showError } from '@/lib/notifications'
import CompleteCourseButton from '@/components/CompleteCourseButton'

interface Course {
  id: string
  title: string
  description: string
  profiles?: {
    full_name: string
  }[] | null
}

interface Lesson {
  id: string
  title: string
  description?: string
  content?: string
  video_url?: string
  duration?: number
  order_index: number
  is_free: boolean
  course_id: string
}

export default function LessonPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && courseId && lessonId) {
      fetchLessonData()
    }
  }, [user, authLoading, courseId, lessonId, router])

  const fetchLessonData = async () => {
    try {
      setLoading(true)

      // Verificar inscripción
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user!.id)
        .eq('course_id', courseId)
        .single()

      if (enrollmentError || !enrollmentData) {
        router.push(`/curso/${courseId}`)
        return
      }

      setIsEnrolled(true)

      // Obtener datos del curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          profiles!instructor_id (
            full_name
          )
        `)
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      // Obtener todas las lecciones del curso
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

      if (lessonsError) throw lessonsError

      // Obtener la lección actual
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('course_id', courseId)
        .single()

      if (lessonError) throw lessonError

      setCourse(courseData)
      setLessons(lessonsData || [])
      setLesson(lessonData)

      // Marcar progreso de la lección
      await markLessonProgress(lessonId)

    } catch (error) {
      console.error('Error fetching lesson data:', error)
      showError('Error al cargar la lección')
    } finally {
      setLoading(false)
    }
  }

  const markLessonProgress = async (lessonId: string) => {
    try {
      // Verificar si ya existe progreso para esta lección
      const { data: existingProgress } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user!.id)
        .eq('lesson_id', lessonId)
        .single()

      if (!existingProgress) {
        // Crear nuevo progreso
        await supabase
          .from('lesson_progress')
          .insert({
            user_id: user!.id,
            lesson_id: lessonId,
            completed: true,
            watch_time: lesson?.duration || 0
          })
      }

      // Actualizar progreso general del curso
      await updateCourseProgress()
    } catch (error) {
      console.error('Error marking lesson progress:', error)
    }
  }

  const updateCourseProgress = async () => {
    try {
      // Obtener todas las lecciones completadas
      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user!.id)
        .eq('completed', true)

      const completedLessonIds = completedLessons?.map(l => l.lesson_id) || []
      const totalLessons = lessons.length
      const completedCount = lessons.filter(l => completedLessonIds.includes(l.id)).length
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      // Actualizar progreso en enrollments
      await supabase
        .from('enrollments')
        .update({ progress })
        .eq('user_id', user!.id)
        .eq('course_id', courseId)
    } catch (error) {
      console.error('Error updating course progress:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lección...</p>
        </div>
      </div>
    )
  }

  if (!course || !lesson || !isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso denegado</h1>
          <p className="text-gray-600 mb-6">No tienes acceso a esta lección.</p>
          <Link
            href={`/curso/${courseId}`}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
          >
            Volver al Curso
          </Link>
        </div>
      </div>
    )
  }

  const currentLessonIndex = lessons.findIndex(l => l.id === lessonId)
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null
  const isLastLesson = currentLessonIndex === lessons.length - 1

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold">
                  <span className="text-secondary-800">Habilix</span>
                  <span className="text-primary-500">Up</span>
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 transition-colors font-medium">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  Inicio
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/cursos" className="text-gray-400 hover:text-gray-500">
                  Cursos
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href={`/curso/${courseId}`} className="text-gray-400 hover:text-gray-500">
                  {course.title}
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-500 font-medium">{lesson.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Video Player */}
              {lesson.video_url && (
                <div className="aspect-video bg-gray-900">
                  <video
                    controls
                    className="w-full h-full"
                    poster="/video-placeholder.jpg"
                  >
                    <source src={lesson.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                  {lesson.duration && (
                    <span className="text-sm text-gray-500">{lesson.duration} min</span>
                  )}
                </div>

                {lesson.description && (
                  <p className="text-gray-600 mb-6">{lesson.description}</p>
                )}

                {/* Lesson Content */}
                <div className="lesson-content prose max-w-none">
                  {lesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  ) : (
                    <p className="text-gray-600">Contenido de la lección no disponible.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
              <div className="flex justify-between items-center">
                {previousLesson ? (
                  <Link
                    href={`/curso/${courseId}/leccion/${previousLesson.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Lección anterior
                  </Link>
                ) : (
                  <div></div>
                )}

                <div>
                  {isLastLesson ? (
                    <CompleteCourseButton 
                      courseId={courseId} 
                      courseTitle={course.title}
                      onComplete={() => {
                        setTimeout(() => {
                          router.push(`/certificado/${courseId}`)
                        }, 2000)
                      }}
                    />
                  ) : nextLesson ? (
                    <Link
                      href={`/curso/${courseId}/leccion/${nextLesson.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      Siguiente lección
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Contenido del Curso</h3>
              <div className="space-y-2">
                {lessons.map((l, index) => (
                  <Link
                    key={l.id}
                    href={`/curso/${courseId}/leccion/${l.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      l.id === lessonId
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{l.title}</p>
                        {l.duration && (
                          <p className="text-xs text-gray-500">{l.duration} min</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .lesson-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.5rem 0 1rem 0;
          color: #1f2937;
        }
        
        .lesson-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: #374151;
        }
        
        .lesson-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #4b5563;
        }
        
        .lesson-content p {
          margin: 1rem 0;
          line-height: 1.7;
          color: #374151;
        }
        
        .lesson-content ul, .lesson-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .lesson-content li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        .lesson-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .lesson-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .lesson-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .lesson-content strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .lesson-content em {
          font-style: italic;
        }
        
        .lesson-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .lesson-content a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </main>
  )
}
