'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

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

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleViewCourse = () => {
    router.push(`/curso/${course.id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
      <div className="relative h-48">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <span className="bg-white/90 backdrop-blur-sm text-primary-600 px-2 py-1 rounded-full text-xs font-semibold">
            {course.level || 'Todos los niveles'}
          </span>
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
            {course.price === 0 ? 'Gratis' : `$${course.price}`}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs sm:text-sm text-primary-500 font-semibold">
            {course.categories?.name || 'General'}
          </span>
        </div>
        
        <h4 className="text-lg sm:text-xl font-bold text-secondary-800 mb-2 line-clamp-2 flex-shrink-0">
          {course.title}
        </h4>
        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 flex-1">
          {course.short_description || course.description}
        </p>
        
        <div className="text-xs sm:text-sm text-gray-500 mb-4">
          <span>Por {course.profiles?.full_name || 'HabilixUp'}</span>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm text-gray-600">{course.rating}/5</span>
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-xs sm:text-sm text-gray-500">
            {course.students_count.toLocaleString()} estudiantes
          </span>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={handleViewCourse}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition duration-300 font-medium text-sm sm:text-base"
          >
            {user ? 'Ver Curso' : 'Ver Detalles'}
          </button>
        </div>
      </div>
    </div>
  )
}
