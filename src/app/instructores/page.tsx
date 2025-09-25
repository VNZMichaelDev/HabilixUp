'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function InstructoresPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    experiencia: '',
    mensaje: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  <span className="text-secondary-800">Habilix</span>
                  <span className="text-primary-500">Up</span>
                </h1>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link href="/" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm lg:text-base">
                Inicio
              </Link>
              <Link href="/cursos" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm lg:text-base">
                Cursos
              </Link>
              <Link href="/instructores" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm lg:text-base">
                Instructores
              </Link>
              <Link href="/about" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm lg:text-base">
                Nosotros
              </Link>
              <Link href="/contact" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm lg:text-base">
                Contacto
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors text-sm"
                  >
                    Mi Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-primary-500 text-white px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors text-sm"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conviértete en Instructor
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Colabora con nosotros enviando tu contenido educativo y nosotros nos encargamos de implementarlo profesionalmente
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#aplicar" 
                className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl"
              >
                Aplicar Ahora
              </a>
              <a 
                href="#beneficios" 
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Ver Beneficios
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10,000+</div>
              <div className="text-gray-600">Estudiantes Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Instructores</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Cursos Disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">4.8★</div>
              <div className="text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">
              ¿Por qué enseñar en HabilixUp?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Te ayudamos a convertir tu conocimiento en cursos profesionales que impacten a miles de estudiantes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compensación Justa</h3>
              <p className="text-gray-600">Recibe compensación basada en el éxito y popularidad de tu curso</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Implementación Profesional</h3>
              <p className="text-gray-600">Nosotros nos encargamos de toda la parte técnica y diseño</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Marketing Incluido</h3>
              <p className="text-gray-600">Promocionamos tus cursos en nuestra plataforma</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Soporte Dedicado</h3>
              <p className="text-gray-600">Equipo especializado para ayudarte en todo momento</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Detallados</h3>
              <p className="text-gray-600">Métricas completas sobre el rendimiento de tus cursos</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad Global</h3>
              <p className="text-gray-600">Acceso a estudiantes de todo el mundo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="aplicar" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">
              Aplica para ser Instructor
            </h2>
            <p className="text-xl text-gray-600">
              Completa el formulario y nos pondremos en contacto contigo en 24-48 horas
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">¡Aplicación Enviada!</h3>
              <p className="text-green-700 mb-4">
                Gracias por tu interés en convertirte en instructor. Revisaremos tu aplicación y nos pondremos en contacto contigo pronto.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    especialidad: '',
                    experiencia: '',
                    mensaje: ''
                  })
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Enviar otra aplicación
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                    Área de Especialidad *
                  </label>
                  <select
                    id="especialidad"
                    name="especialidad"
                    required
                    value={formData.especialidad}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una especialidad</option>
                    <option value="programacion">Programación</option>
                    <option value="diseno">Diseño</option>
                    <option value="marketing">Marketing Digital</option>
                    <option value="negocios">Negocios</option>
                    <option value="idiomas">Idiomas</option>
                    <option value="musica">Música</option>
                    <option value="fotografia">Fotografía</option>
                    <option value="cocina">Cocina</option>
                    <option value="fitness">Fitness</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="experiencia" className="block text-sm font-medium text-gray-700 mb-2">
                  Años de Experiencia *
                </label>
                <select
                  id="experiencia"
                  name="experiencia"
                  required
                  value={formData.experiencia}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona tu experiencia</option>
                  <option value="1-2">1-2 años</option>
                  <option value="3-5">3-5 años</option>
                  <option value="6-10">6-10 años</option>
                  <option value="10+">Más de 10 años</option>
                </select>
              </div>

              <div className="mt-6">
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuéntanos sobre ti *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  rows={4}
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe tu experiencia, qué cursos te gustaría crear, y por qué quieres ser instructor en HabilixUp..."
                />
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Aplicación'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">¿Cómo funciona la compensación?</h3>
              <p className="text-gray-600">La compensación se basa en el éxito y popularidad de tu curso. Discutimos los términos específicos durante el proceso de colaboración.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">¿Qué necesito enviar para colaborar?</h3>
              <p className="text-gray-600">Puedes enviarnos tu contenido en cualquier formato: videos, documentos, presentaciones, o incluso ideas. Nosotros nos encargamos de darle formato profesional.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">¿Cuánto tiempo toma el proceso de colaboración?</h3>
              <p className="text-gray-600">Revisamos todas las aplicaciones en 24-48 horas. Una vez aprobado, trabajamos contigo para implementar tu curso en 1-2 semanas.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">¿Hay algún costo para colaborar?</h3>
              <p className="text-gray-600">No, colaborar con HabilixUp es completamente gratuito. Nosotros invertimos en la implementación y tú recibes compensación por el éxito del curso.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">¿Puedo enseñar en mi idioma nativo?</h3>
              <p className="text-gray-600">¡Por supuesto! Aceptamos cursos en múltiples idiomas. Esto te permite llegar a una audiencia más amplia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu carrera como instructor?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de instructores que ya están transformando vidas y generando ingresos
          </p>
          <a 
            href="#aplicar" 
            className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl inline-block"
          >
            Aplicar Ahora
          </a>
        </div>
      </section>
    </div>
  )
}
