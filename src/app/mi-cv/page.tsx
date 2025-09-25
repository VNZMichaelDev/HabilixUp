'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { profileVerificationService, ProfileVerificationService } from '@/lib/profileVerification'
import { showSuccess, showError } from '@/lib/notifications'

interface CompletedCourse {
  id: string
  title: string
  description: string
  instructor_name: string
  category_name: string
  completed_at: string
  certificate_url?: string
}

interface CompletedEnrollmentData {
  id: string
  progress: number
  created_at: string
  courses: {
    id: string
    title: string
    description: string
    profiles: {
      full_name: string
    } | null
    categories: {
      name: string
    } | null
  }
}

export default function MiCVPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(false)
  const [loadingVerification, setLoadingVerification] = useState(true)
  const supabase = createClientSupabaseClient()

  const fetchCompletedCourses = useCallback(async () => {
    try {
      if (!user?.id) {
        setLoadingCourses(false)
        return
      }
      
      // Buscar cursos completados (progreso = 100%) del usuario actual
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          created_at,
          courses (
            id,
            title,
            description,
            profiles (
              full_name
            ),
            categories (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('progress', 100) // Solo cursos completados al 100%
        .returns<CompletedEnrollmentData[]>()

      if (error) {
        console.warn('No se pudieron cargar cursos de la base de datos:', error.message)
        setCompletedCourses([]) // Lista vacía si hay error
        setLoadingCourses(false)
        return
      }

      const formattedCompletedCourses = data?.map((enrollment: CompletedEnrollmentData) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        description: enrollment.courses.description,
        instructor_name: enrollment.courses.profiles?.full_name || 'Instructor',
        category_name: enrollment.courses.categories?.name || 'General',
        completed_at: enrollment.created_at, // Usamos la fecha de inscripción como aproximación
      })) || []

      setCompletedCourses(formattedCompletedCourses)
    } catch (error) {
      console.warn('Error al cargar cursos completados:', error)
      setCompletedCourses([]) // Lista vacía si hay error
    } finally {
      setLoadingCourses(false)
    }
  }, [user, supabase])

  const fetchVerificationData = useCallback(async () => {
    try {
      if (!user?.id) {
        setLoadingVerification(false)
        return
      }

      // Obtener código de verificación existente o crear uno nuevo
      const code = await profileVerificationService.getOrCreateVerificationCode(user.id)
      setVerificationCode(code)

      // Obtener estado de visibilidad pública
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_public')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.warn('Error obteniendo configuración de perfil:', profileError)
        setIsPublic(false) // Valor por defecto
      } else {
        setIsPublic(profile?.is_public || false)
      }
    } catch (error) {
      console.error('Error fetching verification data:', error)
      showError('Error al cargar la configuración de verificación')
      // Establecer valores por defecto en caso de error
      setVerificationCode('')
      setIsPublic(false)
    } finally {
      setLoadingVerification(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchCompletedCourses()
      fetchVerificationData()
    }
  }, [user, loading, router, fetchCompletedCourses, fetchVerificationData])

  const generateCertificate = async (courseId: string) => {
    // Aquí implementaremos la generación del certificado
    alert('Generando certificado... (Funcionalidad en desarrollo)')
  }

  const downloadCVAsPDF = async () => {
    try {
      // Importar las librerías dinámicamente
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).jsPDF

      // Mostrar mensaje de carga
      const loadingMessage = document.createElement('div')
      loadingMessage.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                    z-index: 9999; text-align: center;">
          <div style="margin-bottom: 10px;">Generando CV en PDF...</div>
          <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; 
                      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `
      document.body.appendChild(loadingMessage)

      // Capturar todo el contenido del CV (excluyendo header)
      const cvContent = document.getElementById('cv-content') as HTMLElement
      if (!cvContent) {
        alert('Error: No se pudo encontrar el contenido del CV')
        document.body.removeChild(loadingMessage)
        return
      }

      // Crear canvas del CV con configuración mejorada
      const canvas = await html2canvas(cvContent, {
        useCORS: true,
        allowTaint: false,
        scale: 2, // Mayor calidad
        height: cvContent.scrollHeight,
        width: cvContent.scrollWidth,
        scrollX: 0,
        scrollY: 0
      } as any)

      // Crear PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calcular dimensiones manteniendo proporción
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight)
      const scaledWidth = imgWidth * ratio
      const scaledHeight = imgHeight * ratio
      
      const imgX = (pdfWidth - scaledWidth) / 2
      const imgY = 10 // Margen superior

      // Si la imagen cabe en una página
      if (scaledHeight <= pdfHeight - 20) {
        pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight)
      } else {
        // Dividir en múltiples páginas
        const pageHeight = pdfHeight - 20
        let sourceY = 0
        let pageNumber = 0
        
        while (sourceY < imgHeight) {
          if (pageNumber > 0) {
            pdf.addPage()
          }
          
          const remainingHeight = imgHeight - sourceY
          const pageSourceHeight = Math.min(remainingHeight, pageHeight / ratio)
          const pageScaledHeight = pageSourceHeight * ratio
          
          // Crear canvas temporal para esta sección
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = imgWidth
          tempCanvas.height = pageSourceHeight
          const tempCtx = tempCanvas.getContext('2d')
          
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, imgWidth, pageSourceHeight, 0, 0, imgWidth, pageSourceHeight)
            const tempImgData = tempCanvas.toDataURL('image/png')
            pdf.addImage(tempImgData, 'PNG', imgX, imgY, scaledWidth, pageScaledHeight)
          }
          
          sourceY += pageSourceHeight
          pageNumber++
        }
      }

      // Generar nombre del archivo
      const userName = user?.profile?.full_name || user?.email?.split('@')[0] || 'Usuario'
      const fileName = `CV_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_HabilixUp.pdf`

      // Descargar
      pdf.save(fileName)

      // Remover mensaje de carga
      document.body.removeChild(loadingMessage)

    } catch (error) {
      console.error('Error generando PDF del CV:', error)
      alert('Error al generar el PDF. Por favor, intenta de nuevo.')
      // Remover mensaje de carga si existe
      const loadingMessages = document.querySelectorAll('[style*="position: fixed"]')
      loadingMessages.forEach(msg => {
        if (msg.parentNode) {
          msg.parentNode.removeChild(msg)
        }
      })
    }
  }

  const togglePublicVisibility = async () => {
    try {
      if (!user?.id) {
        showError('Error: Usuario no autenticado')
        return
      }
      
      const newVisibility = await profileVerificationService.togglePublicVisibility(user.id)
      setIsPublic(newVisibility)
      
      const message = newVisibility 
        ? 'Tu CV ahora es público y puede ser verificado por terceros'
        : 'Tu CV ahora es privado'
      
      showSuccess(message)
      
    } catch (error) {
      console.error('Error toggling visibility:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar la visibilidad del CV'
      showError(errorMessage)
    }
  }

  const copyVerificationUrl = async () => {
    try {
      const url = ProfileVerificationService.getPublicCVUrl(verificationCode)
      await navigator.clipboard.writeText(url)
      showSuccess('¡Enlace de verificación copiado al portapapeles!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      showError('Error al copiar el enlace')
    }
  }

  const shareCV = async () => {
    const url = ProfileVerificationService.getPublicCVUrl(verificationCode)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CV de ${user?.profile?.full_name || user?.email}`,
          text: '¡Mira mi CV verificado en HabilixUp!',
          url: url,
        })
      } catch (error) {
        console.log('Error sharing:', error)
        copyVerificationUrl()
      }
    } else {
      copyVerificationUrl()
    }
  }

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
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/cursos" className="text-gray-700 hover:text-primary-600 transition-colors">
                Cursos
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-300"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div id="cv-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CV Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.profile?.full_name || 'Usuario de HabilixUp'}
            </h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="flex justify-center space-x-4">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                Estudiante HabilixUp
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {completedCourses.length} Cursos Completados
              </span>
            </div>
          </div>

          {/* Resumen */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Profesional</h2>
            <p className="text-gray-700 leading-relaxed">
              Estudiante comprometido con el aprendizaje continuo a través de la plataforma HabilixUp. 
              He completado {completedCourses.length} cursos especializados, demostrando dedicación y 
              habilidades en múltiples áreas del conocimiento. Busco aplicar los conocimientos adquiridos 
              en proyectos reales y continuar creciendo profesionalmente.
            </p>
          </div>
        </div>

        {/* Cursos Completados */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cursos Completados</h2>
            <div className="text-sm text-gray-500">
              Certificados por HabilixUp
            </div>
          </div>

          {loadingCourses ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando cursos...</p>
            </div>
          ) : completedCourses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No has completado cursos aún</h3>
              <p className="text-gray-600 mb-6">
                ¡Completa tu primer curso para que aparezca en tu CV!
              </p>
              <Link
                href="/cursos"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
              >
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {completedCourses.map((course) => (
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
                        <span className="text-sm font-medium">Completado</span>
                      </div>
                      <Link
                        href={`/certificado/${course.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition duration-300 text-center block"
                      >
                        Ver Certificado
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habilidades Adquiridas */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Habilidades Adquiridas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {completedCourses.length > 0 ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilidades Técnicas</h3>
                  <div className="flex flex-wrap gap-2">
                    {completedCourses.map((course) => (
                      <span key={course.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {course.category_name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Competencias</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Aprendizaje Continuo</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Autodisciplina</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Resolución de Problemas</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                Completa cursos para mostrar tus habilidades aquí
              </div>
            )}
          </div>
        </div>

        {/* Verificación y Compartir */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Verificación del CV</h2>
          
          {loadingVerification ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando configuración...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estado de visibilidad */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Visibilidad del CV</h3>
                  <p className="text-sm text-gray-600">
                    {isPublic 
                      ? 'Tu CV es público y puede ser verificado por terceros'
                      : 'Tu CV es privado, solo tú puedes verlo'
                    }
                  </p>
                </div>
                <button
                  onClick={togglePublicVisibility}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                    isPublic 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {isPublic ? '✓ Público' : '○ Privado'}
                </button>
              </div>

              {/* Código de verificación */}
              {verificationCode && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Código de Verificación</h3>
                  <div className="flex items-center space-x-3">
                    <code className="bg-white px-3 py-2 rounded border text-blue-800 font-mono font-bold">
                      {verificationCode}
                    </code>
                    <button
                      onClick={copyVerificationUrl}
                      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-300 text-sm"
                    >
                      Copiar Enlace
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Comparte este enlace para que otros puedan verificar tu CV
                  </p>
                </div>
              )}

              {/* URL pública */}
              {isPublic && verificationCode && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">URL Pública del CV</h3>
                  <div className="text-sm text-green-700 break-all mb-3">
                    {ProfileVerificationService.getPublicCVUrl(verificationCode)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={shareCV}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Compartir CV
                    </button>
                    <Link
                      href={`/cv/${verificationCode}`}
                      target="_blank"
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ver CV Público
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={downloadCVAsPDF}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </button>
            <button 
              onClick={shareCV}
              disabled={!isPublic || !verificationCode}
              className={`px-6 py-3 rounded-lg transition duration-300 flex items-center justify-center ${
                isPublic && verificationCode
                  ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Compartir CV
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
