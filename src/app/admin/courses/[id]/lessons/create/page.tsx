'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAuthService } from '@/lib/adminAuth'
import { AdminCourseService, CreateLessonData } from '@/lib/adminCourseService'
import { showError, showSuccess } from '@/lib/notifications'

export default function CreateLessonPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courseTitle, setCourseTitle] = useState('')
  const [nextOrderIndex, setNextOrderIndex] = useState(1)

  const [formData, setFormData] = useState<CreateLessonData>({
    course_id: courseId,
    title: '',
    description: '',
    content: '',
    video_url: '',
    duration: 0,
    order_index: 1,
    is_free: false
  })

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/login')
        return
      }

      const adminStatus = await AdminAuthService.isAdmin(user.id)
      setIsAdmin(adminStatus)
      
      if (!adminStatus) {
        showError('Acceso denegado. No tienes permisos de administrador.')
        router.push('/dashboard')
        return
      }

      setLoading(false)
      loadCourseInfo()
    }

    checkAdminAccess()
  }, [user, authLoading, router, courseId])

  const loadCourseInfo = async () => {
    if (!user) return

    // Obtener información del curso
    const coursesResult = await AdminCourseService.getAllCourses(user.id)
    if (coursesResult.success && coursesResult.data) {
      const course = coursesResult.data.find(c => c.id === courseId)
      if (course) {
        setCourseTitle(course.title)
      }
    }

    // Obtener lecciones existentes para determinar el siguiente orden
    const lessonsResult = await AdminCourseService.getCourseLessons(user.id, courseId)
    if (lessonsResult.success && lessonsResult.data) {
      const maxOrder = lessonsResult.data.length > 0 
        ? Math.max(...lessonsResult.data.map(l => l.order_index))
        : 0
      const nextOrder = maxOrder + 1
      setNextOrderIndex(nextOrder)
      setFormData(prev => ({ ...prev, order_index: nextOrder }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    if (!formData.title.trim()) {
      showError('El título de la lección es obligatorio')
      return
    }

    setSaving(true)

    try {
      const result = await AdminCourseService.createLesson(user.id, formData)
      
      if (result.success) {
        showSuccess('Lección creada exitosamente')
        router.push(`/admin/courses/${courseId}?tab=lessons`)
      } else {
        showError(result.error || 'Error al crear lección')
      }
    } catch (error) {
      showError('Error inesperado al crear lección')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold">
                  <span className="text-secondary-800">Habilix</span>
                  <span className="text-primary-500">Up</span>
                  <span className="text-red-600 ml-2 text-sm">ADMIN</span>
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/admin" className="text-gray-700 hover:text-primary-600 transition-colors">
                Panel Admin
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4 text-sm">
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-gray-500">Panel Admin</Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href={`/admin/courses/${courseId}`} className="text-gray-400 hover:text-gray-500">
                  {courseTitle || 'Curso'}
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-500">Nueva Lección</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Lección</h1>
            <p className="text-gray-600 mt-1">Curso: {courseTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Lección *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Introducción a React Hooks"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Breve descripción de lo que se aprenderá en esta lección"
              />
            </div>

            {/* Contenido */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido de la Lección
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Contenido completo de la lección (HTML permitido)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Puedes usar HTML básico para formatear el contenido (h2, h3, p, ul, li, strong, em, etc.)
              </p>
            </div>

            {/* Orden y Duración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                  Orden en el Curso
                </label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Siguiente disponible: {nextOrderIndex}
                </p>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: 15"
                />
              </div>
            </div>

            {/* URL de Video */}
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL del Video (opcional)
              </label>
              <input
                type="url"
                id="video_url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Lección gratuita */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_free"
                name="is_free"
                checked={formData.is_free}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_free" className="ml-2 block text-sm text-gray-900">
                Lección gratuita (accesible sin inscripción)
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href={`/admin/courses/${courseId}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Lección'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
