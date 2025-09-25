'use client'

import { useEffect, useState } from 'react'
import { StudyTimeService, StudyTimeData } from '@/lib/studyTime'

interface StudyStatsProps {
  userId: string
  enrolledCoursesCount: number
}

export default function StudyStats({ userId, enrolledCoursesCount }: StudyStatsProps) {
  const [studyTimeData, setStudyTimeData] = useState<StudyTimeData>({
    totalMinutes: 0,
    thisWeekMinutes: 0,
    todayMinutes: 0,
    averagePerDay: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudyTime = async () => {
      try {
        if (!userId) {
          console.warn('No userId provided to StudyStats')
          return
        }

        const { studyTimeService } = await import('@/lib/studyTime')
        const data = await studyTimeService.getUserStudyTime(userId)
        setStudyTimeData(data)
      } catch (error) {
        console.error('Error fetching study time:', error)
        // En caso de error, mantener los valores por defecto (0)
        setStudyTimeData({
          totalMinutes: 0,
          thisWeekMinutes: 0,
          todayMinutes: 0,
          averagePerDay: 0
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchStudyTime()
    } else {
      setLoading(false)
    }
  }, [userId])

  const formatTime = StudyTimeService.formatStudyTime(studyTimeData)

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-200 p-3 rounded-full mr-4 w-12 h-12"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {/* Cursos Inscritos */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
        <div className="flex items-center">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Cursos Activos</h3>
            <p className="text-sm text-gray-600">{enrolledCoursesCount} cursos inscritos</p>
          </div>
        </div>
      </div>

      {/* Tiempo Total */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
        <div className="flex items-center">
          <div className="bg-emerald-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tiempo Total</h3>
            <p className="text-sm text-gray-600">{formatTime.total} estudiados</p>
          </div>
        </div>
      </div>

      {/* Esta Semana */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Esta Semana</h3>
            <p className="text-sm text-gray-600">{formatTime.thisWeek} de estudio</p>
          </div>
        </div>
      </div>

      {/* Promedio Diario */}
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Promedio Diario</h3>
            <p className="text-sm text-gray-600">{formatTime.averagePerDay} por día</p>
          </div>
        </div>
      </div>
    </div>
  )
}
