'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CourseCard from '@/components/CourseCard'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

interface Course {
  id: string
  title: string
  description: string
  short_description?: string
  instructor_id?: string
  category_id?: string
  price: number
  duration?: string
  level?: 'Principiante' | 'Intermedio' | 'Avanzado'
  image_url?: string
  video_preview_url?: string
  is_published: boolean
  rating: number
  students_count: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
  }
  categories?: {
    name: string
    slug: string
  }
}

export default function CursosPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [categories, setCategories] = useState<string[]>(['Todos'])
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchCourses()
  }, [/* eslint-disable-line react-hooks/exhaustive-deps */])

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      
      // Obtener cursos publicados con información del instructor y categoría
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles (
            full_name
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCourses(coursesData || [])

      // Extraer categorías únicas
      const uniqueCategories = ['Todos']
      coursesData?.forEach(course => {
        if (course.categories?.name && !uniqueCategories.includes(course.categories.name)) {
          uniqueCategories.push(course.categories.name)
        }
      })
      setCategories(uniqueCategories)

    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const filteredCourses = selectedCategory === 'Todos' 
    ? courses 
    : courses.filter(course => course.categories?.name === selectedCategory)

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
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <Link href="/" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm xl:text-base">
                Inicio
              </Link>
              <Link href="/cursos" className="text-primary-500 font-medium text-sm xl:text-base">
                Cursos
              </Link>
              <Link href="/instructores" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm xl:text-base">
                Instructores
              </Link>
              <Link href="/about" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm xl:text-base">
                Nosotros
              </Link>
              <Link href="/contact" className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm xl:text-base">
                Contacto
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-primary-500 text-white px-3 sm:px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors text-sm"
                  >
                    <span className="hidden sm:inline">Mi Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-secondary-800 font-medium hover:text-primary-500 transition-colors text-sm hidden sm:inline"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-primary-500 text-white px-3 sm:px-6 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors text-sm"
                  >
                    <span className="hidden sm:inline">Registrarse</span>
                    <span className="sm:hidden">Registro</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cursoss.png"
            alt="Explora nuestros cursos"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
            Explora Nuestros Cursos
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto px-4">
            Descubre una amplia variedad de cursos diseñados para impulsar tu carrera profesional
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 sm:py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-6 py-2 rounded-full border transition-colors text-sm sm:text-base ${
                  selectedCategory === category
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando cursos...</p>
              </div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'Todos' ? 'Todos los Cursos' : `Cursos de ${selectedCategory}`}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} disponible{filteredCourses.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay cursos disponibles</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory === 'Todos' 
                  ? 'Aún no hay cursos publicados en la plataforma.'
                  : `No hay cursos disponibles en la categoría "${selectedCategory}".`
                }
              </p>
              {selectedCategory !== 'Todos' && (
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
                >
                  Ver Todos los Cursos
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/noencuentras.png"
            alt="No encuentras lo que buscas"
            fill
            className="object-cover object-center"
            style={{ objectPosition: '50% 30%' }}
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿No encuentras lo que buscas?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Contáctanos y te ayudaremos a encontrar el curso perfecto para ti
          </p>
          <Link href="/contact" className="bg-white text-secondary-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300">
            Contactar
          </Link>
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
