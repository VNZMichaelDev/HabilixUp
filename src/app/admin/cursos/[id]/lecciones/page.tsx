'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  order_index: number
}

export default function AdminCourseLessonsPage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const supabase = createClientSupabaseClient()

  const [isAdmin, setIsAdmin] = useState(false)
  const [items, setItems] = useState<Lesson[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) setIsAdmin(user?.profile?.role === 'admin')
  }, [user, loading])

  const load = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
      if (error) throw error
      setItems((data || []) as Lesson[])
    } catch (e) {
      console.error('Load lessons error:', e)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Lecciones del Curso</h1>
        <p className="text-gray-600">Acceso restringido a administradores.</p>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lecciones del Curso</h1>
        <button onClick={load} className="px-4 py-2 rounded border hover:bg-gray-50">Refrescar</button>
      </div>

      {loadingData ? (
        <div className="text-gray-600">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">Este curso aún no tiene lecciones.</div>
      ) : (
        <div className="bg-white rounded-lg border">
          <ul>
            {items.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{l.title || 'Lección'}</div>
                  <div className="text-xs text-gray-500">Orden: {l.order_index}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/cursos/${courseId}/leccion/${l.id}/quiz`} className="px-3 py-1.5 rounded border hover:bg-gray-50">Editar Quiz</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
