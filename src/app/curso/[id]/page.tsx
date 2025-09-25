'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { showError, showSuccess } from '@/lib/notifications'
import { paymentsService, type PaymentMethod } from '@/lib/payments'

interface Course {
  id: string
  title: string
  description: string
  short_description?: string
  instructor_id?: string
  category_id?: string
  price: number
  duration?: string
  level?: 'Principiante' | 'Intermedio' | 'Avanzado'
  image_url?: string
  video_preview_url?: string
  is_published: boolean
  rating: number
  students_count: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
  }
  categories?: {
    name: string
    slug: string
  }
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
}

export default function CoursePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [reqLoading, setReqLoading] = useState(false)
  const [reqFullName, setReqFullName] = useState('')
  const [reqIdNumber, setReqIdNumber] = useState('')
  const [reqHasExperience, setReqHasExperience] = useState(false)
  const [reqExperienceNotes, setReqExperienceNotes] = useState('')
  const [reqMethod, setReqMethod] = useState<PaymentMethod>('pago_movil')
  const [reqLast6, setReqLast6] = useState('')
  const [reqSentCapture, setReqSentCapture] = useState(false)
  const supabase = createClientSupabaseClient()

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true)

      // Obtener datos del curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles (
            full_name
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('id', courseId)
        .eq('is_published', true)
        .single()

      if (courseError) throw courseError

      // Obtener lecciones del curso
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

      if (lessonsError) throw lessonsError

      // Verificar si el usuario está inscrito
      if (user) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single()

        if (!enrollmentError && enrollmentData) {
          setIsEnrolled(true)
        }
      }

      setCourse(courseData)
      setLessons(lessonsData || [])
    } catch (error) {
      console.error('Error fetching course data:', error)
      showError('Error al cargar el curso')
    } finally {
      setLoading(false)
    }
  }, [courseId, supabase, user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && courseId) {
      fetchCourseData()
    }
  }, [user, authLoading, courseId, router, fetchCourseData])

  

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setEnrolling(true)
    try {
      if (course?.price && course.price > 0) {
        // Cursos de pago: abrir modal de solicitud
        setShowRequestModal(true)
      } else {
        // Cursos gratis: inscripción directa
        const { error } = await supabase
          .from('enrollments')
          .insert({ user_id: user.id, course_id: courseId, progress: 0 })
        if (error) throw error
        setIsEnrolled(true)
        showSuccess('¡Te has inscrito exitosamente al curso!')
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      showError('Error al inscribirse al curso')
    } finally {
      setEnrolling(false)
    }
  }

  const submitEnrollmentRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/login'); return }
    // Validaciones por método
    if (reqMethod === 'pago_movil') {
      const onlyDigits = reqLast6.replace(/\D/g, '')
      if (onlyDigits.length !== 6) {
        showError('Ingresa los últimos 6 dígitos de la referencia (exactamente 6)')
        return
      }
    }
    try {
      setReqLoading(true)
      await paymentsService.createPaymentRequest({
        userId: user.id,
        courseId: courseId,
        fullName: reqFullName,
        idNumber: reqIdNumber,
        hasExperience: reqHasExperience,
        experienceNotes: reqExperienceNotes || undefined,
        method: reqMethod,
        last6digits: reqMethod === 'pago_movil' ? reqLast6.replace(/\D/g, '') : undefined,
        sentCapture: reqSentCapture,
      })
      setShowRequestModal(false)
      showSuccess('Solicitud enviada. Un administrador la revisará pronto.')
    } catch (err:any) {
      console.error('Payment request error:', err)
      showError(err?.message || 'Error enviando solicitud')
    } finally {
      setReqLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h1>
          <p className="text-gray-600 mb-6">El curso que buscas no existe o no está disponible.</p>
          <Link
            href="/cursos"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
          >
            Ver Todos los Cursos
          </Link>
        </div>
      </div>
    )
  }

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
              <Link href="/cursos" className="text-gray-700 hover:text-primary-600 transition-colors">
                Cursos
              </Link>
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
                <span className="text-gray-500 font-medium">{course.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Course Image */}
              {course.image_url && (
                <div className="relative aspect-video bg-gray-200">
                  <Image
                    src={course.image_url}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {course.categories?.name || 'General'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {course.level || 'Todos los niveles'}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm text-gray-600">{course.rating}/5</span>
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{course.students_count} estudiantes</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-600">
                    Instructor: {course.profiles?.full_name || 'HabilixUp'}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-lg shadow-lg mt-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Contenido del Curso</h2>
                <p className="text-sm text-gray-600 mt-1">{lessons.length} lecciones</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {lesson.is_free && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                            Gratis
                          </span>
                        )}
                        {lesson.duration && (
                          <span className="text-sm text-gray-500">{lesson.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {course.price === 0 ? 'Gratis' : `$${course.price}`}
                </div>
                {course.duration && (
                  <p className="text-sm text-gray-600">Duración: {course.duration}</p>
                )}
              </div>

              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-800 font-medium">Ya estás inscrito</p>
                  </div>
                  
                  {lessons.length > 0 && (
                    <Link
                      href={`/curso/${courseId}/leccion/${lessons[0].id}`}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition duration-300 text-center block font-medium"
                    >
                      Continuar Aprendiendo
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition duration-300 ${
                      enrolling
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {enrolling ? 'Procesando...' : (course.price > 0 ? 'Solicitar Inscripción' : 'Inscribirse al Curso')}
                  </button>

                  {showRequestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
                        <div className="px-6 py-4 border-b">
                          <h3 className="text-lg font-semibold">Solicitud de Inscripción</h3>
                          <p className="text-sm text-gray-600">Completa el formulario para que un administrador apruebe tu inscripción.</p>
                        </div>
                        <form onSubmit={submitEnrollmentRequest} className="p-6 space-y-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Nombre Completo</label>
                            <input value={reqFullName} onChange={e=>setReqFullName(e.target.value)} required className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Cédula / ID</label>
                            <input value={reqIdNumber} onChange={e=>setReqIdNumber(e.target.value)} required className="w-full border rounded px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Método de Pago</label>
                            <select value={reqMethod} onChange={e=>setReqMethod(e.target.value as PaymentMethod)} className="w-full border rounded px-3 py-2">
                              <option value="pago_movil">Pago Móvil</option>
                              <option value="binance">Binance Pay</option>
                              <option value="paypal">PayPal</option>
                            </select>
                          </div>

                          {/* Instrucciones condicionales por método */}
                          {reqMethod === 'pago_movil' && (
                            <div className="rounded border p-3 bg-orange-50 text-sm">
                              <div className="font-semibold mb-1">Pago Móvil</div>
                              <div>Banco: <span className="font-mono">Banco de Venezuela (0102)</span></div>
                              <div>Cédula/RIF: <span className="font-mono">18.833.714</span></div>
                              <div>Teléfono: <span className="font-mono">0416-362-00-93</span></div>
                              <div className="mt-2">
                                <label className="block text-sm text-gray-700 mb-1">Últimos 6 dígitos de la referencia</label>
                                <input value={reqLast6} onChange={e=>setReqLast6(e.target.value)} placeholder="Ej: 123456" className="w-full border rounded px-3 py-2"/>
                                <p className="text-xs text-gray-500 mt-1">Obligatorio para Pago Móvil</p>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <input id="sentCapPm" type="checkbox" checked={reqSentCapture} onChange={e=>setReqSentCapture(e.target.checked)} />
                                <label htmlFor="sentCapPm">Ya envié el capture por WhatsApp al <span className="font-mono">+58 424 585 1434</span></label>
                              </div>
                            </div>
                          )}

                          {reqMethod === 'binance' && (
                            <div className="rounded border p-3 bg-yellow-50 text-sm">
                              <div className="font-semibold mb-1">Binance Pay</div>
                              <div>ID de Pay: <span className="font-mono">{process.env.NEXT_PUBLIC_BINANCE_PAY_ID || 'Configura NEXT_PUBLIC_BINANCE_PAY_ID'}</span></div>
                              <div className="mt-2 flex items-center gap-2">
                                <input id="sentCapBn" type="checkbox" checked={reqSentCapture} onChange={e=>setReqSentCapture(e.target.checked)} />
                                <label htmlFor="sentCapBn">Envié el capture del pago al WhatsApp <span className="font-mono">+58 424 585 1434</span></label>
                              </div>
                            </div>
                          )}

                          {reqMethod === 'paypal' && (
                            <div className="rounded border p-3 bg-blue-50 text-sm">
                              <div className="font-semibold mb-1">PayPal</div>
                              <div>Enviar a: <span className="font-mono">maikermicha15@gmail.com</span></div>
                              <div className="mt-2 flex items-center gap-2">
                                <input id="sentCapPp" type="checkbox" checked={reqSentCapture} onChange={e=>setReqSentCapture(e.target.checked)} />
                                <label htmlFor="sentCapPp">Envié el capture del pago al WhatsApp <span className="font-mono">+58 424 585 1434</span></label>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input id="hasExp" type="checkbox" checked={reqHasExperience} onChange={e=>setReqHasExperience(e.target.checked)} />
                            <label htmlFor="hasExp" className="text-sm">Tengo experiencia previa</label>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Notas de experiencia (opcional)</label>
                            <textarea value={reqExperienceNotes} onChange={e=>setReqExperienceNotes(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={()=>setShowRequestModal(false)} className="px-4 py-2 rounded border">Cancelar</button>
                            <button type="submit" disabled={reqLoading} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
                              {reqLoading ? 'Enviando…' : 'Enviar Solicitud'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Este curso incluye:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {lessons.length} lecciones
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Acceso de por vida
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Certificado de finalización
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte del instructor
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
