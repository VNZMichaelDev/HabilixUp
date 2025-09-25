'use client'

import { useEffect, useState, useCallback } from 'react'
import { quizService } from '@/lib/quiz'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Certificate, { downloadCertificateAsPDF } from '@/components/Certificate'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

interface CourseData {
  id: string
  title: string
  instructor_name: string
  completed_at: string
}

interface EnrollmentData {
  id: string
  progress: number
  enrolled_at: string
  completed_at: string | null
  courses: {
    id: string
    title: string
    description: string
    profiles: {
      full_name: string
    } | null
  }
}

export default function CertificatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string
  
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const supabase = createClientSupabaseClient()

  const fetchCourseData = useCallback(async () => {
    try {
      if (!user?.id) return

      // Verificar que el usuario haya completado este curso
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          enrolled_at,
          completed_at,
          courses (
            id,
            title,
            description,
            profiles (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .gte('progress', 99) // Considerar completado con >= 99% para evitar problemas de redondeo
        .maybeSingle()
        .returns<EnrollmentData | null>()

      if (error) throw error

      if (!data) {
        // El usuario no ha completado este curso
        console.info('[Certificado] No hay inscripción con progreso >=99% para', { userId: user.id, courseId })
        setCourseData(null)
        return
      }

      const enrollmentData = data as EnrollmentData
      
      if (!enrollmentData.courses) {
        setCourseData(null)
        return
      }

      // Revisar si existe examen final requerido y si está aprobado
      const exam = await quizService.getCourseExam(courseId)
      if (exam?.required_for_certificate) {
        const last = await quizService.getLastExamAttempt(user.id, exam.id)
        if (!last || !last.passed) {
          console.info('[Certificado] Examen final requerido no aprobado', { userId: user.id, courseId, examId: exam.id })
          setCourseData(null)
          return
        }
      }

      const courseData = {
        id: enrollmentData.courses.id,
        title: enrollmentData.courses.title,
        instructor_name: enrollmentData.courses.profiles?.full_name || 'Instructor',
        completed_at: enrollmentData.completed_at || enrollmentData.enrolled_at
      }

      setCourseData(courseData)
    } catch (error) {
      console.error('Error fetching course data:', error)
      setCourseData(null)
    } finally {
      setLoadingCourse(false)
    }
  }, [user, courseId, supabase])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && courseId) {
      fetchCourseData()
    }
  }, [user, loading, router, courseId, fetchCourseData])

  const handleDownloadPDF = () => {
    if (courseData && user) {
      const certificateData = {
        studentName: user.profile?.full_name || user.email || 'Estudiante',
        courseName: courseData.title,
        instructorName: courseData.instructor_name,
        completionDate: courseData.completed_at,
        courseId: courseData.id
      }
      
      downloadCertificateAsPDF(certificateData)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado de ${courseData?.title}`,
          text: `¡He completado el curso "${courseData?.title}" en HabilixUp!`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles!')
    }
  }

  if (loading || loadingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando certificado...</p>
        </div>
      </div>
    )
  }

  if (!user || (!loadingCourse && !courseData)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificado no disponible</h1>
          <p className="text-gray-600 mb-6">
            {!user 
              ? "Debes iniciar sesión para ver certificados."
              : "Este certificado no está disponible. Asegúrate de haber completado el curso al 100%."
            }
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
            >
              Volver al Dashboard
            </Link>
            <Link
              href="/cursos"
              className="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Ver Cursos Disponibles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificado de Finalización</h1>
            <p className="text-gray-600 mt-2">Curso: {courseData?.title}</p>
          </div>
          <Link
            href="/mi-cv"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
          >
            ← Volver al CV
          </Link>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {courseData && (
          <Certificate
            studentName={user?.profile?.full_name || user?.email || 'Estudiante'}
            courseName={courseData.title}
            instructorName={courseData.instructor_name}
            completionDate={courseData.completed_at}
            courseId={courseData.id}
          />
        )}
      </div>

      {/* Actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones del Certificado</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownloadPDF}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </button>
            
            <button
              onClick={handleShare}
              className="bg-secondary-600 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Compartir
            </button>

            <button
              onClick={() => window.print()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>

            <Link
              href="/mi-cv"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Mi CV
            </Link>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate, #certificate * {
            visibility: visible;
          }
          #certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </main>
  )
}
