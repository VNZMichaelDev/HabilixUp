'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { profileVerificationService, PublicProfile } from '@/lib/profileVerification'

export default function PublicProfilePage() {
  const params = useParams()
  const code = params.code as string
  
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!code) {
          setError('Código de verificación no válido')
          return
        }

        const publicProfile = await profileVerificationService.getPublicProfile(code)
        
        if (!publicProfile) {
          setError('Perfil no encontrado o no público')
          return
        }

        setProfile(publicProfile)
      } catch (err) {
        console.error('Error fetching public profile:', err)
        setError('Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h1>
          <p className="text-gray-600 mb-6">
            {error || 'El perfil que buscas no existe o no está disponible públicamente.'}
          </p>
          <Link
            href="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
          >
            Ir a HabilixUp
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

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Perfil Verificado</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.full_name}
            </h1>
            <p className="text-gray-600 mb-4">Estudiante Certificado de HabilixUp</p>
            <div className="flex justify-center space-x-4">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Perfil Verificado
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {profile.studyStats.totalCourses} Cursos Completados
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 border-t pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{profile.studyStats.totalCourses}</div>
              <div className="text-sm text-gray-500">Cursos Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{profile.studyStats.totalHours}h</div>
              <div className="text-sm text-gray-500">Horas de Estudio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{profile.studyStats.certificatesEarned}</div>
              <div className="text-sm text-gray-500">Certificados Obtenidos</div>
            </div>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cursos Completados</h2>
            <div className="text-sm text-gray-500">
              Certificados Verificables
            </div>
          </div>

          {profile.completedCourses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cursos completados</h3>
              <p className="text-gray-600">
                Este usuario aún no ha completado ningún curso.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {profile.completedCourses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Instructor: {course.instructor_name}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {course.category_name}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                          </svg>
                          Completado: {new Date(course.completed_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">✓ Verificado</span>
                      </div>
                      {course.certificate_url && (
                        <Link
                          href={course.certificate_url}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition duration-300 text-center block"
                        >
                          Ver Certificado
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Verificación del Perfil</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Perfil Verificado</h3>
                <p className="text-green-700">
                  Este perfil ha sido verificado por HabilixUp. Todos los cursos y certificados mostrados son auténticos.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Código de verificación: <span className="font-mono font-bold">{profile.verification_code}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
