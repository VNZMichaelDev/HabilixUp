'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { studyTimeService, StudyTimeData, StudyTimeService } from '@/lib/studyTime'
import StudyStats from '@/components/StudyStats'

interface EnrolledCourse {
  id: string
  title: string
  description: string
  image_url: string
  progress: number
  instructor_name: string
  category_name: string
}

interface EnrollmentData {
  id: string
  progress: number
  courses: {
    id: string
    title: string
    description: string
    image_url: string
    profiles: {
      full_name: string
    } | null
    categories: {
      name: string
    } | null
  }
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [studyTimeData, setStudyTimeData] = useState<StudyTimeData>({
    totalMinutes: 0,
    thisWeekMinutes: 0,
    todayMinutes: 0,
    averagePerDay: 0
  })
  const [loadingStudyTime, setLoadingStudyTime] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientSupabaseClient()

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user?.email === 'maikermicha15@gmail.com') {
      setIsAdmin(true)
    }
  }, [user])

  const fetchEnrolledCourses = useCallback(async () => {
    try {
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          courses (
            id,
            title,
            description,
            image_url,
            profiles (
              full_name
            ),
            categories (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .returns<EnrollmentData[]>()

      if (error) throw error

      const formattedCourses = data?.map((enrollment: EnrollmentData) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        image_url: enrollment.courses.image_url,
        progress: enrollment.progress,
        instructor_name: enrollment.courses.profiles?.full_name || 'Instructor',
        category_name: enrollment.courses.categories?.name || 'General'
      })) || []

      setEnrolledCourses(formattedCourses)
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }, [user, supabase])

  const fetchStudyTime = useCallback(async () => {
    try {
      if (!user?.id) return
      
      const studyTime = await studyTimeService.getUserStudyTime(user.id)
      setStudyTimeData(studyTime)
    } catch (error) {
      console.error('Error fetching study time:', error)
    } finally {
      setLoadingStudyTime(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchEnrolledCourses()
      fetchStudyTime()
    }
  }, [user, loading, router, fetchEnrolledCourses, fetchStudyTime])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold">
                  <span className="text-secondary-800">Habilix</span>
                  <span className="text-primary-500">Up</span>
                </h1>
              </Link>
            </div>

            {/* Navigation - Removed for dashboard */}

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut()
                    router.push('/')
                  } catch (error) {
                    console.error('Error during logout:', error)
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido, {user.profile?.full_name || user.email}!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Continúa tu aprendizaje y alcanza tus objetivos
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-primary-600">{enrolledCourses.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Cursos inscritos</div>
            </div>
          </div>
        </div>

        {/* Study Statistics */}
        {user?.id && (
          <StudyStats 
            userId={user.id} 
            enrolledCoursesCount={enrolledCourses.length}
          />
        )}

        {/* Quick Actions */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 sm:gap-6 mb-6 sm:mb-8`}>
          <Link href="/cursos" className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Explorar Cursos</h3>
                <p className="text-xs sm:text-sm text-gray-600">Descubre nuevos cursos</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Progreso Total</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {enrolledCourses.length > 0 
                    ? `${Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)}% completado`
                    : 'Sin progreso aún'
                  }
                </p>
              </div>
            </div>
          </div>

          <Link href="/mi-cv" className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition duration-300">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Mi CV</h3>
                <p className="text-xs sm:text-sm text-gray-600">Ver mi currículum</p>
              </div>
            </div>
          </Link>

          {/* Panel de Administrador - Solo visible para admin */}
          {isAdmin && (
            <Link href="/admin" className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition duration-300 border-2 border-red-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 text-sm sm:text-base">Panel de Administrador</h3>
                  <p className="text-xs sm:text-sm text-red-600">Gestionar plataforma</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mis Cursos</h2>
            <Link href="/cursos" className="text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base">
              Ver todos los cursos →
            </Link>
          </div>

          {loadingCourses ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando cursos...</p>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes cursos aún</h3>
              <p className="text-gray-600 mb-6">
                ¡Comienza tu viaje de aprendizaje inscribiéndote en tu primer curso!
              </p>
              <Link
                href="/cursos"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
              >
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="relative h-40 sm:h-48 bg-gray-200">
                    {course.image_url && (
                      <Image
                        src={course.image_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white px-2 py-1 rounded text-sm font-semibold text-gray-900">
                        {Math.round(course.progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="text-xs sm:text-sm text-primary-600 font-semibold mb-1">{course.category_name}</div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{Math.round(course.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">Por {course.instructor_name}</span>
                      <Link
                        href={`/cursos/${course.id}`}
                        className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-300 text-center text-sm"
                      >
                        Continuar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
