"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { paymentsService, type PaymentMethod } from '@/lib/payments'
import { showError, showSuccess } from '@/lib/notifications'

interface Props {
  courseId: string
  firstLessonId?: string
  price: number
}

export default function CourseActions({ courseId, firstLessonId, price }: Props) {
  const { user, loading, isEnrolledInCourse, enrollInCourse } = useAuth()
  const [working, setWorking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [hasExperience, setHasExperience] = useState(false)
  const [experienceNotes, setExperienceNotes] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('pago_movil')
  const router = useRouter()
  const isFree = price === 0

  const targetLessonHref = useMemo(() => {
    if (!firstLessonId) return `/cursos/${courseId}`
    return `/cursos/${courseId}/leccion/${firstLessonId}`
  }, [courseId, firstLessonId])

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/cursos/${courseId}`)
      return
    }
    setWorking(true)
    try {
      if (!isFree) {
        // Cursos de pago: abrir modal de requisitos/pago
        setShowModal(true)
        return
      }

      const already = await isEnrolledInCourse(courseId)
      if (!already) {
        await enrollInCourse(courseId)
      }
      router.push(targetLessonHref)
    } catch (e) {
      console.error('Enroll error', e)
      // Podríamos mostrar un toast aquí si tuvieras alguno
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* CTA principal */}
      <button
        onClick={handleEnroll}
        disabled={loading || working}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {working ? 'Procesando…' : isFree ? 'Acceder al Curso' : 'Solicitar Inscripción'}
      </button>

      {/* Acceso directo a la primera lección si ya está inscrito */}
      {user && (
        <Link
          href={targetLessonHref}
          className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition duration-300"
        >
          Ir a la primera lección
        </Link>
      )}

      {/* Modal para cursos de pago */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Solicitud de Inscripción</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Para cursos de pago, por favor completa los requisitos. Nuestro asesor se pondrá en contacto contigo.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Tu nombre y apellido" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="V-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Tienes experiencia en este ámbito?</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={hasExperience} onChange={e => setHasExperience(e.target.checked)} />
                    <span>Sí, tengo experiencia</span>
                  </label>
                </div>
                <textarea value={experienceNotes} onChange={e => setExperienceNotes(e.target.value)} className="mt-2 w-full border rounded-lg px-3 py-2" placeholder="Opcional: cuéntanos brevemente tu experiencia" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setMethod('pago_movil')} className={`px-3 py-2 rounded-lg border ${method==='pago_movil' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}>Pago Móvil</button>
                  <button type="button" onClick={() => setMethod('binance')} className={`px-3 py-2 rounded-lg border ${method==='binance' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}>Binance</button>
                  <button type="button" onClick={() => setMethod('paypal')} className={`px-3 py-2 rounded-lg border ${method==='paypal' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}>PayPal</button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href={`https://wa.me/584245851434?text=${encodeURIComponent('Hola, quiero inscribirme al curso ' + courseId + '. Mis datos: ' + fullName + ' - Cédula: ' + idNumber + (hasExperience ? ' - Con experiencia' : ' - Sin experiencia'))}`} target="_blank" rel="noreferrer" className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Contactar por WhatsApp
              </a>
              <button
                onClick={async () => {
                  if (!user) {
                    showError('Debes iniciar sesión')
                    return
                  }
                  if (!fullName.trim() || !idNumber.trim()) {
                    showError('Completa nombre y cédula')
                    return
                  }
                  try {
                    setWorking(true)
                    await paymentsService.createPaymentRequest({
                      userId: user.id,
                      courseId,
                      fullName,
                      idNumber,
                      hasExperience,
                      experienceNotes,
                      method
                    })
                    showSuccess('Solicitud enviada. Verificación en ~24 horas.')
                    setShowModal(false)
                  } catch (e:any) {
                    console.error('Create payment request error:', e)
                    showError(e?.message || 'Error enviando solicitud')
                  } finally {
                    setWorking(false)
                  }
                }}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
                disabled={working}
              >
                {working ? 'Enviando…' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
