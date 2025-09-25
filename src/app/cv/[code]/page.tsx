'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { profileVerificationService, PublicProfile } from '@/lib/profileVerification'

export default function PublicCVPage() {
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
          setError('CV no encontrado o no público')
          return
        }

        setProfile(publicProfile)
      } catch (err) {
        console.error('Error fetching public CV:', err)
        setError('Error al cargar el CV')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [code])

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

      // Capturar todo el contenido del CV
      const cvContent = document.getElementById('public-cv-content') as HTMLElement
      if (!cvContent) {
        alert('Error: No se pudo encontrar el contenido del CV')
        document.body.removeChild(loadingMessage)
        return
      }

      // Crear canvas del CV
      const canvas = await html2canvas(cvContent, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
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
      
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight)
      const scaledWidth = imgWidth * ratio
      const scaledHeight = imgHeight * ratio
      
      const imgX = (pdfWidth - scaledWidth) / 2
      const imgY = 10

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
      const fileName = `CV_${profile?.full_name.replace(/[^a-zA-Z0-9]/g, '_')}_HabilixUp_Verificado.pdf`

      // Descargar
      pdf.save(fileName)

      // Remover mensaje de carga
      document.body.removeChild(loadingMessage)

    } catch (error) {
      console.error('Error generando PDF del CV:', error)
      alert('Error al generar el PDF. Por favor, intenta de nuevo.')
      const loadingMessages = document.querySelectorAll('[style*="position: fixed"]')
      loadingMessages.forEach(msg => {
        if (msg.parentNode) {
          msg.parentNode.removeChild(msg)
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando CV...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CV no encontrado</h1>
          <p className="text-gray-600 mb-6">
            {error || 'El CV que buscas no existe o no está disponible públicamente.'}
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
      {/* Header - No se incluye en el PDF */}
      <header className="bg-white shadow-sm print:hidden">
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
              <span className="text-sm text-gray-500">CV Verificado</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Actions - No se incluye en el PDF */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 print:hidden">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">CV de {profile.full_name}</h2>
              <p className="text-sm text-gray-600">Perfil verificado por HabilixUp</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={downloadCVAsPDF}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div id="public-cv-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* CV Header */}
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

          {/* Resumen */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Profesional</h2>
            <p className="text-gray-700 leading-relaxed">
              Estudiante comprometido con el aprendizaje continuo a través de la plataforma HabilixUp. 
              He completado {profile.studyStats.totalCourses} cursos especializados, acumulando {profile.studyStats.totalHours} horas de estudio,
              demostrando dedicación y habilidades en múltiples áreas del conocimiento. Busco aplicar los conocimientos adquiridos 
              en proyectos reales y continuar creciendo profesionalmente.
            </p>
          </div>
        </div>

        {/* Cursos Completados */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cursos Completados</h2>
            <div className="text-sm text-gray-500">
              Certificados Verificables por HabilixUp
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
                <div key={course.id} className="border border-gray-200 rounded-lg p-6">
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
                    <div className="flex items-center text-green-600 ml-4">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Completado</span>
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
            {profile.completedCourses.length > 0 ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilidades Técnicas</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(profile.completedCourses.map(course => course.category_name))).map((category) => (
                      <span key={category} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {category}
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
                No hay habilidades registradas aún
              </div>
            )}
          </div>
        </div>

        {/* Verificación */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Verificación del CV</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-900">CV Verificado por HabilixUp</h3>
                <p className="text-green-700">
                  Este CV ha sido verificado por HabilixUp. Todos los cursos y certificados mostrados son auténticos y verificables.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Código de verificación: <span className="font-mono font-bold">{profile.verification_code}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Verifica este CV en: {typeof window !== 'undefined' ? window.location.href : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          #public-cv-content {
            max-width: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </main>
  )
}
