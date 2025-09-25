'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAuthService } from '@/lib/adminAuth'
import { AdminCourseService, AdminCourse } from '@/lib/adminCourseService'
import { showError, showSuccess } from '@/lib/notifications'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)

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
      loadCourses()
    }

    checkAdminAccess()
  }, [user, authLoading, router])

  const loadCourses = async () => {
    if (!user) return

    setCoursesLoading(true)
    const result = await AdminCourseService.getAllCourses(user.id)
    
    if (result.success && result.data) {
      setCourses(result.data)
    } else {
      showError(result.error || 'Error al cargar cursos')
    }
    
    setCoursesLoading(false)
  }

  const handleTogglePublication = async (courseId: string, currentStatus: boolean) => {
    if (!user) return

    const result = await AdminCourseService.toggleCoursePublication(user.id, courseId, !currentStatus)
    
    if (result.success) {
      showSuccess(`Curso ${!currentStatus ? 'publicado' : 'despublicado'} exitosamente`)
      loadCourses() // Recargar cursos
    } else {
      showError(result.error || 'Error al cambiar estado de publicación')
    }
  }

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!user) return

    if (!confirm(`¿Estás seguro de que quieres eliminar el curso "${courseTitle}"? Esta acción no se puede deshacer.`)) {
      return
    }

    const result = await AdminCourseService.deleteCourse(user.id, courseId)
    
    if (result.success) {
      showSuccess('Curso eliminado exitosamente')
      loadCourses() // Recargar cursos
    } else {
      showError(result.error || 'Error al eliminar el curso')
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
              <Link href="/admin" className="text-primary-600 font-medium border-b-2 border-primary-600">
                Panel Admin
              </Link>
              <Link href="/admin/pagos" className="text-gray-700 hover:text-primary-600 transition-colors">
                Solicitudes
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Admin: {user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administrador</h1>
          <p className="text-gray-600">Gestiona cursos, lecciones y contenido de la plataforma</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/courses/create"
            className="bg-primary-600 text-white p-6 rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <h3 className="font-semibold">Crear Curso</h3>
                <p className="text-sm opacity-90">Nuevo curso</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/pagos"
            className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Solicitudes</h3>
                <p className="text-sm opacity-90">Inscripciones de pago</p>
              </div>
            </div>
          </Link>

          <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div>
                <h3 className="font-semibold">Total Cursos</h3>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Publicados</h3>
                <p className="text-2xl font-bold">{courses.filter(c => c.is_published).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Borradores</h3>
                <p className="text-2xl font-bold">{courses.filter(c => !c.is_published).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Cursos</h2>
          </div>

          {coursesLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando cursos...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay cursos creados aún.</p>
              <Link
                href="/admin/courses/create"
                className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Crear primer curso
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          course.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${course.price === 0 ? 'Gratis' : course.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.students_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleTogglePublication(course.id, course.is_published)}
                          className={`${
                            course.is_published 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {course.is_published ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
