'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Contact() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Crear el cuerpo del email
      const emailBody = `
Nuevo mensaje de contacto desde HabilixUp:

Nombre: ${formData.name}
Email: ${formData.email}
Asunto: ${formData.subject}

Mensaje:
${formData.message}

---
Enviado desde el formulario de contacto de HabilixUp
      `.trim()

      // Crear el enlace mailto
      const mailtoLink = `mailto:elixirwebstudio@gmail.com?subject=Contacto HabilixUp - ${formData.subject}&body=${encodeURIComponent(emailBody)}`
      
      // Abrir el cliente de email
      window.location.href = mailtoLink
      
      // Limpiar el formulario
      setFormData({ name: '', email: '', subject: '', message: '' })
      alert('Se abrirá tu cliente de email para enviar el mensaje.')
      
    } catch (error) {
      alert('Hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">
                <span className="text-secondary-800">Habilix</span>
                <span className="text-primary-500">Up</span>
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors">
                Inicio
              </Link>
              <Link href="/cursos" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors">
                Cursos
              </Link>
              <Link href="/instructores" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors">
                Instructores
              </Link>
              <Link href="/about" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors">
                Nosotros
              </Link>
              <Link href="/contact" className="text-primary-500 font-medium">
                Contacto
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-primary-500 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors"
                  >
                    Mi Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-secondary-800 font-medium hover:text-primary-500 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-primary-500 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors"
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
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/contacto.png"
            alt="Contacto"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contáctanos
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte en tu viaje de aprendizaje
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-secondary-800 mb-8">
                Envíanos un mensaje
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="general">Consulta general</option>
                    <option value="cursos">Información sobre cursos</option>
                    <option value="tecnico">Soporte técnico</option>
                    <option value="colaboracion">Colaboración/Partnerships</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-habilix text-white py-4 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary-800 mb-8">
                  Información de contacto
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-800">Email</h3>
                      <p className="text-gray-600">elixirwebstudio@gmail.com</p>
                      <p className="text-gray-600">soporte@habilixup.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-800">Teléfono</h3>
                      <p className="text-gray-600">+58 4245851434</p>
                      <p className="text-sm text-gray-500">Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-800">Horario de atención</h3>
                      <p className="text-gray-600">Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Sábados: 10:00 AM - 2:00 PM</p>
                      <p className="text-gray-600">Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-secondary-800 mb-4">
                  Preguntas frecuentes
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      ¿Cómo puedo acceder a mis cursos?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Una vez registrado, puedes acceder a todos tus cursos desde tu dashboard personal.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      ¿Ofrecen certificados?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Sí, al completar un curso recibirás un certificado digital verificable.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      ¿Hay soporte técnico disponible?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier problema técnico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <Image
                  src="/logo.png"
                  alt="HabilixUp Logo"
                  width={50}
                  height={50}
                  className="mr-3"
                />
                <div>
                  <h4 className="text-2xl font-bold">
                    <span className="text-white">Habilix</span>
                    <span className="text-primary-400">Up</span>
                  </h4>
                  <p className="text-gray-400 text-sm">Transforma tu futuro</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                La plataforma líder en educación online. Aprende habilidades demandadas con instructores expertos y contenido actualizado.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-700 hover:bg-primary-500 p-3 rounded-full transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="bg-gray-700 hover:bg-primary-500 p-3 rounded-full transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold mb-6 text-lg">Categorías</h5>
              <ul className="space-y-3">
                <li><Link href="/cursos" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Programación</Link></li>
                <li><Link href="/cursos" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Diseño</Link></li>
                <li><Link href="/cursos" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Marketing</Link></li>
                <li><Link href="/cursos" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center"><span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>Negocios</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold mb-6 text-lg">Soporte</h5>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Nosotros</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Contacto</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2024 HabilixUp. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Plataforma Segura
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Certificado SSL
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
