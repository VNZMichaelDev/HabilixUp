'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  hideLogo?: boolean
  variant?: 'default' | 'dashboard'
  showOnlyCursos?: boolean
}

export default function Header({ hideLogo = false, variant = 'default', showOnlyCursos = false }: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className={`${variant === 'dashboard' ? 'bg-white shadow-sm border-b border-gray-200' : 'bg-white shadow-sm'} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          {!hideLogo && (
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-lg sm:text-xl font-bold">
                  <span className="text-secondary-800">Habilix</span>
                  <span className="text-primary-500">Up</span>
                </h1>
              </Link>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Inicio
            </Link>
            <Link href="/cursos" className="text-gray-700 hover:text-primary-600 transition-colors">
              Cursos
            </Link>
            <Link href="/instructores" className="text-gray-700 hover:text-primary-600 transition-colors">
              Instructores
            </Link>
            {!showOnlyCursos && (
              <>
                <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Nosotros
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Contacto
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut || loading}
                  className={
                    `${variant === 'dashboard' 
                      ? 'bg-primary-600 hover:bg-primary-700' 
                      : 'bg-red-600 hover:bg-red-700'} text-white px-3 py-2 rounded-md transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`
                  }
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cerrando...
                    </>
                  ) : (
                    'Cerrar Sesión'
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 transition-colors font-medium text-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium text-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                href="/cursos" 
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link 
                href="/instructores" 
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Instructores
              </Link>
              {!showOnlyCursos && (
                <>
                  <Link 
                    href="/about" 
                    className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Nosotros
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contacto
                  </Link>
                </>
              )}
              
              {/* Mobile User Actions */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/dashboard"
                      className="text-primary-600 hover:text-primary-700 transition-colors font-medium px-2 py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      disabled={isLoggingOut || loading}
                      className={
                        `${variant === 'dashboard' 
                          ? 'bg-primary-600 hover:bg-primary-700' 
                          : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2 text-sm mx-2 disabled:opacity-50 disabled:cursor-not-allowed`
                      }
                    >
                      {isLoggingOut ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cerrando...
                        </>
                      ) : (
                        'Cerrar Sesión'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/login"
                      className="text-primary-600 hover:text-primary-700 transition-colors font-medium px-2 py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium text-center mx-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
