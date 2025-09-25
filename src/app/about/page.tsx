'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import CounterAnimation from '@/components/CounterAnimation'

export default function About() {
  const { user } = useAuth()

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
              <Link href="/about" className="text-primary-500 font-medium">
                Nosotros
              </Link>
              <Link href="/contact" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors">
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
            src="/nosotros.png"
            alt="Sobre nosotros"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sobre HabilixUp
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Transformamos vidas a través de la educación online de calidad
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-800 mb-6">
                Nuestra Misión
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                En HabilixUp, creemos que la educación de calidad debe ser accesible para todos. 
                Nuestra misión es democratizar el aprendizaje, ofreciendo cursos online que 
                preparan a las personas para los trabajos del futuro.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Trabajamos con instructores expertos de la industria para crear contenido 
                actualizado y relevante que realmente impacte en la carrera profesional 
                de nuestros estudiantes.
              </p>
            </div>
            <div className="relative h-96">
              <Image
                src="/paginaprincipal.png"
                alt="Nuestra misión"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-800 mb-12">
            Nuestro Impacto
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <CounterAnimation 
                end={10000} 
                suffix="+" 
                className="text-4xl font-bold text-primary-500 mb-2"
                duration={2500}
              />
              <div className="text-gray-600">Estudiantes Activos</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <CounterAnimation 
                end={50} 
                suffix="+" 
                className="text-4xl font-bold text-primary-500 mb-2"
                duration={2000}
              />
              <div className="text-gray-600">Cursos Disponibles</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <CounterAnimation 
                end={95} 
                suffix="%" 
                className="text-4xl font-bold text-primary-500 mb-2"
                duration={2200}
              />
              <div className="text-gray-600">Tasa de Satisfacción</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl font-bold text-primary-500 mb-2">24/7</div>
              <div className="text-gray-600">Soporte Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-800 mb-12">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Innovación</h3>
              <p className="text-gray-600">
                Constantemente actualizamos nuestro contenido y metodologías para 
                mantenernos a la vanguardia de la educación digital.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Comunidad</h3>
              <p className="text-gray-600">
                Fomentamos un ambiente de aprendizaje colaborativo donde 
                estudiantes e instructores se apoyan mutuamente.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-secondary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Calidad</h3>
              <p className="text-gray-600">
                Nos comprometemos a ofrecer contenido de la más alta calidad, 
                revisado y validado por expertos de la industria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para unirte a nuestra comunidad?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Comienza tu viaje de aprendizaje hoy mismo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/cursos"
                className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl"
              >
                Ver Cursos
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl"
                >
                  Comenzar Gratis
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Contáctanos
                </Link>
              </>
            )}
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
