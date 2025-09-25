'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAuthService } from '@/lib/adminAuth'
import { AdminCourseService, CreateCourseData } from '@/lib/adminCourseService'
import { showError, showSuccess } from '@/lib/notifications'

export default function CreateCoursePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState<CreateCourseData>({
    title: '',
    description: '',
    short_description: '',
    category_id: '',
    price: 0,
    duration: '',
    level: 'Principiante',
    image_url: '',
    video_preview_url: '',
    is_published: false
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
      loadCategories()
    }

    checkAdminAccess()
  }, [user, authLoading, router])

  const loadCategories = async () => {
    if (!user) return

    const result = await AdminCourseService.getCategories(user.id)
    if (result.success && result.data) {
      setCategories(result.data)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
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

    if (!formData.title.trim() || !formData.description.trim()) {
      showError('El título y la descripción son obligatorios')
      return
    }

    setSaving(true)

    try {
      const result = await AdminCourseService.createCourse(user.id, formData)
      
      if (result.success) {
        showSuccess('Curso creado exitosamente')
        router.push('/admin')
      } else {
        showError(result.error || 'Error al crear curso')
      }
    } catch (error) {
      showError('Error inesperado al crear curso')
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
                <span className="text-gray-500">Crear Curso</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h1>
            <p className="text-gray-600 mt-1">Completa la información básica del curso</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Curso *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Introducción a React"
              />
            </div>

            {/* Descripción corta */}
            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Corta
              </label>
              <input
                type="text"
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Breve descripción para las tarjetas de curso"
              />
            </div>

            {/* Descripción completa */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Completa *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descripción detallada del curso, objetivos, qué aprenderán los estudiantes..."
              />
            </div>

            {/* Categoría y Nivel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            {/* Precio y Duración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0 para curso gratuito"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duración
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: 8 semanas, 20 horas"
                />
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label htmlFor="video_preview_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Video Preview
                </label>
                <input
                  type="url"
                  id="video_preview_url"
                  name="video_preview_url"
                  value={formData.video_preview_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Publicar */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                Publicar curso inmediatamente
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin"
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
                  'Crear Curso'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
