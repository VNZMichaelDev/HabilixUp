'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CourseCompletionService } from '@/lib/courseCompletion'
import { showSuccess, showError } from '@/lib/notifications'

interface CompleteCourseButtonProps {
  courseId: string
  courseTitle: string
  onComplete?: () => void
}

export default function CompleteCourseButton({ 
  courseId, 
  courseTitle, 
  onComplete 
}: CompleteCourseButtonProps) {
  const { user } = useAuth()
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Verificar si el curso ya está completado
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user) return

      setIsChecking(true)
      
      try {
        const completed = await CourseCompletionService.isCourseCompleted(courseId, user.id)
        setIsCompleted(completed)
      } catch (error) {
        console.error('Error checking course completion:', error)
        setIsCompleted(false)
      }
      
      setIsChecking(false)
    }

    checkCompletion()
  }, [courseId, user])

  const handleCompleteCourse = async () => {
    if (!user) {
      showError('Debes iniciar sesión para completar el curso')
      return
    }

    setIsLoading(true)

    try {
      const result = await CourseCompletionService.completeCourse(courseId, user.id)

      if (result.success) {
        setIsCompleted(true)
        showSuccess(`¡Felicitaciones! Has completado el curso "${courseTitle}"`)

        // Llamar callback si existe
        if (onComplete) {
          onComplete()
        }
      } else {
        showError(result.error || 'Error al completar el curso')
      }
    } catch (error) {
      console.error('Error completing course:', error)
      showError('Error inesperado al completar el curso')
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-500 bg-gray-100">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
        Verificando...
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="inline-flex items-center px-6 py-3 border border-green-300 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        ¡Curso Completado!
      </div>
    )
  }

  return (
    <button
      onClick={handleCompleteCourse}
      disabled={isLoading}
      className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
        isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
      }`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Completando...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ¡Completar Curso!
        </>
      )}
    </button>
  )
}
