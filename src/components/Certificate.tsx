'use client'

import React from 'react'
import Image from 'next/image'

interface CertificateProps {
  studentName: string
  courseName: string
  instructorName: string
  completionDate: string
  courseId: string
}

export default function Certificate({ 
  studentName, 
  courseName, 
  instructorName, 
  completionDate, 
  courseId 
}: CertificateProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl" id="certificate">
      {/* Certificate Container */}
      <div className="relative p-12 border-8 border-gradient-to-r from-primary-500 to-secondary-500" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6) 1'
      }}>
        
        {/* Decorative Border */}
        <div className="absolute inset-4 border-2 border-gray-200 rounded-lg"></div>
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-4xl font-bold">
              <span className="text-secondary-800">Habilix</span>
              <span className="text-primary-500">Up</span>
            </h1>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-700 uppercase tracking-wider">
            Certificado de Finalización
          </h2>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8 relative z-10">
          <p className="text-lg text-gray-600 mb-6">
            Por la presente se certifica que
          </p>
          
          <h3 className="text-4xl font-bold text-secondary-800 mb-6 border-b-2 border-primary-500 pb-2 inline-block">
            {studentName}
          </h3>
          
          <p className="text-lg text-gray-600 mb-4">
            ha completado exitosamente el curso
          </p>
          
          <h4 className="text-2xl font-semibold text-primary-600 mb-6">
            &ldquo;{courseName}&rdquo;
          </h4>
          
          <p className="text-lg text-gray-600 mb-2">
            Impartido por <span className="font-semibold text-secondary-800">{instructorName}</span>
          </p>
          
          <p className="text-lg text-gray-600">
            Completado el <span className="font-semibold">{new Date(completionDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </p>
        </div>

        {/* Signatures Section */}
        <div className="flex justify-between items-end mt-12 relative z-10">
          {/* ElixirWeb Studio Signature */}
          <div className="text-center">
            <div className="w-48 h-20 mb-4 flex items-end justify-center">
              <div className="text-2xl font-bold text-primary-600 border-b-2 border-gray-400 pb-2">
                ElixirWeb Studio
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-semibold">ElixirWeb Studio</p>
              <p>Desarrollo y Tecnología</p>
            </div>
          </div>

          {/* HabilixUp Logo Center */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-2xl font-bold">H</span>
            </div>
            <p className="text-xs text-gray-500">ID: {courseId}</p>
          </div>

          {/* Michael Escobar Signature */}
          <div className="text-center">
            <div className="w-48 h-20 mb-4 flex items-end justify-center">
              <div className="relative w-40 h-16 border-b-2 border-gray-400 pb-2">
                <Image
                  src="/Firma.png"
                  alt="Firma de Michael Escobar"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Michael Escobar</p>
              <p>CEO, HabilixUp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200 relative z-10">
          <p className="text-sm text-gray-500">
            Este certificado verifica la finalización exitosa del curso en la plataforma HabilixUp
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Verificar autenticidad en: www.habilixup.com/verificar/{courseId}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 left-8 w-16 h-16 border-4 border-primary-200 rounded-full opacity-20"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-4 border-secondary-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 border-4 border-primary-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-4 border-secondary-200 rounded-full opacity-20"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30 pointer-events-none"></div>
      </div>
    </div>
  )
}

// Función para generar y descargar el certificado como PDF
export const downloadCertificateAsPDF = async (certificateData: CertificateProps) => {
  try {
    // Importar las librerías dinámicamente para evitar problemas de SSR
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).jsPDF

    // Buscar el elemento del certificado
    const certificateElement = document.getElementById('certificate')
    if (!certificateElement) {
      alert('Error: No se pudo encontrar el certificado para descargar')
      return
    }

    // Mostrar mensaje de carga
    const loadingMessage = document.createElement('div')
    loadingMessage.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                  z-index: 9999; text-align: center;">
        <div style="margin-bottom: 10px;">Generando certificado PDF...</div>
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

    // Configurar opciones para html2canvas
    const canvas = await html2canvas(certificateElement, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff',
      width: certificateElement.scrollWidth,
      height: certificateElement.scrollHeight
    })

    // Crear PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Calcular dimensiones para ajustar al PDF
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = (pdfHeight - imgHeight * ratio) / 2

    // Agregar imagen al PDF
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)

    // Generar nombre del archivo
    const fileName = `Certificado_${certificateData.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${certificateData.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    // Descargar el PDF
    pdf.save(fileName)

    // Remover mensaje de carga
    document.body.removeChild(loadingMessage)

  } catch (error) {
    console.error('Error generando PDF:', error)
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
