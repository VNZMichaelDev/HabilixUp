'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { AdminAuthService } from '@/lib/adminAuth'

interface DebugInfo {
  user: any
  profile: any
  isAdmin: boolean
  adminCheck: any
}

export default function AdminDebugPage() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) return

    try {
      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Verificar si es admin
      const isAdmin = await AdminAuthService.isAdmin(user.id)

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: profile || { error: profileError?.message },
        isAdmin,
        adminCheck: {
          expectedEmail: 'maikermicha15@gmail.com',
          actualEmail: user.email,
          emailMatch: user.email === 'maikermicha15@gmail.com',
          profileRole: profile?.role,
          hasAdminRole: profile?.role === 'admin'
        }
      })
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fixAdminRole = async () => {
    if (!user || user.email !== 'maikermicha15@gmail.com') {
      alert('Solo el email maikermicha15@gmail.com puede ser promovido a admin')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (error) {
        alert('Error al actualizar rol: ' + error.message)
      } else {
        alert('Rol actualizado exitosamente')
        checkAdminStatus() // Recargar info
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No autenticado</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver esta página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug: Estado de Administrador</h1>
        
        {debugInfo && (
          <div className="space-y-6">
            {/* Estado del Usuario */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>

            {/* Estado del Perfil */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Perfil en Base de Datos</h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.profile, null, 2)}
              </pre>
            </div>

            {/* Verificación de Admin */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Verificación de Administrador</h2>
              <div className="space-y-2">
                <p><strong>Es Admin:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${debugInfo.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {debugInfo.isAdmin ? 'SÍ' : 'NO'}
                  </span>
                </p>
              </div>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-4">
                {JSON.stringify(debugInfo.adminCheck, null, 2)}
              </pre>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Acciones</h2>
              <div className="space-y-4">
                <button
                  onClick={checkAdminStatus}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Recargar Estado
                </button>
                
                {user.email === 'maikermicha15@gmail.com' && !debugInfo.isAdmin && (
                  <button
                    onClick={fixAdminRole}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
                  >
                    Corregir Rol de Admin
                  </button>
                )}
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">Instrucciones</h2>
              <div className="text-yellow-700 space-y-2">
                <p><strong>1.</strong> Asegúrate de estar logueado con maikermicha15@gmail.com</p>
                <p><strong>2.</strong> Si el perfil no existe, ejecuta el script SQL en Supabase</p>
                <p><strong>3.</strong> Si el perfil existe pero no tiene rol admin, usa el botón &quot;Corregir Rol de Admin&quot;</p>
                <p><strong>4.</strong> Después de corregir, ve a <a href="/admin" className="underline">/admin</a></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
