'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import CounterAnimation from '@/components/CounterAnimation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const { user, loading } = useAuth()
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner fullScreen message="Verificando autenticación..." />
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-secondary-800">Habilix</span>
                <span className="text-primary-500">Up</span>
              </h1>
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
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-secondary-800 leading-tight">
                  Aprende En Línea
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Expande tus habilidades con los mejores cursos online. Accede a contenido de calidad, instructores expertos y una comunidad de aprendizaje que te ayudará a alcanzar tus metas profesionales.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600">Certificaciones reconocidas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600">Aprende a tu propio ritmo</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600">Acceso de por vida</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {user ? (
                  <>
                    <Link
                      href="/cursos"
                      className="bg-gradient-habilix text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:opacity-90 transition-opacity text-center shadow-lg"
                    >
                      Ver Mis Cursos
                    </Link>
                    <Link
                      href="/dashboard"
                      className="inline-block border-2 border-primary-500 text-primary-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                    >
                      Mi Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="bg-gradient-habilix text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:opacity-90 transition-opacity text-center shadow-lg"
                    >
                      Comenzar Ahora
                    </Link>
                    <Link
                      href="/cursos"
                      className="inline-block border-2 border-primary-500 text-primary-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                    >
                      Ver Cursos
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative order-first lg:order-last">
              <div className="relative h-64 sm:h-80 lg:h-96 w-full -mt-4 lg:-mt-8">
                <Image
                  src="/paginaprincipal.png"
                  alt="Aprende en línea con HabilixUp"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-secondary-800 mb-12">
            ¿Por qué elegir HabilixUp?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-secondary-800">Cursos Estructurados</h4>
              <p className="text-gray-600">Lecciones organizadas paso a paso para un aprendizaje efectivo</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-secondary-800">Certificaciones</h4>
              <p className="text-gray-600">Obtén certificados reconocidos al completar tus cursos</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-secondary-800">Aprende a tu Ritmo</h4>
              <p className="text-gray-600">Acceso 24/7 para que estudies cuando mejor te convenga</p>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-secondary-800 mb-4">
              ¿Eres un Experto en tu Campo?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Únete a nuestra comunidad de instructores y comparte tu conocimiento con miles de estudiantes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-800">Envía tu contenido</h4>
                    <p className="text-gray-600">Comparte tu conocimiento y nosotros lo convertimos en un curso profesional</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-800">Recibe compensación</h4>
                    <p className="text-gray-600">Obtén beneficios basados en el éxito de tu curso</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-800">Impacta miles de vidas</h4>
                    <p className="text-gray-600">Ayuda a estudiantes a alcanzar sus metas profesionales</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-800">Implementación completa</h4>
                    <p className="text-gray-600">Nosotros nos encargamos de toda la parte técnica</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <Link
                  href="/instructores"
                  className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Convertirme en Instructor
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-primary-100 to-secondary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-secondary-800 mb-4">¡Únete Hoy!</h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Proceso de aplicación simple</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Herramientas de creación incluidas</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Comisiones competitivas</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Marketing y promoción</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/principalbajo.png"
            alt="Transforma tu futuro"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              ¿Listo para transformar tu futuro?
            </h3>
            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed">
              Únete a más de <span className="font-bold text-yellow-300">10,000 estudiantes</span> que ya están construyendo carreras exitosas
            </p>
            <p className="text-lg text-white/80 mb-8">
              Acceso inmediato • Certificaciones reconocidas • Soporte 24/7
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {user ? (
              <>
                <Link 
                  href="/cursos" 
                  className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Explorar Mis Cursos
                </Link>
                <Link 
                  href="/dashboard" 
                  className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Mi Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Comenzar Gratis
                </Link>
                <Link 
                  href="/cursos" 
                  className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Ver Cursos
                </Link>
              </>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <CounterAnimation 
                end={50} 
                suffix="+" 
                className="text-3xl font-bold text-white mb-1"
                duration={2000}
              />
              <div className="text-white/80 text-sm">Cursos</div>
            </div>
            <div className="text-center">
              <CounterAnimation 
                end={10000} 
                suffix="+" 
                className="text-3xl font-bold text-white mb-1"
                duration={2500}
              />
              <div className="text-white/80 text-sm">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.8★</div>
              <div className="text-white/80 text-sm">Valoración</div>
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
