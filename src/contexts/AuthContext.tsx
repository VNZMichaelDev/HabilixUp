'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, authService } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { showSuccess, showError } from '@/lib/notifications'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isEnrolledInCourse: (courseId: string) => Promise<boolean>
  enrollInCourse: (courseId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener usuario inicial
    const getInitialUser = async () => {
      try {
        setLoading(true)
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        console.log('Initial user loaded:', currentUser ? 'authenticated' : 'not authenticated')
      } catch (error) {
        console.error('Error getting initial user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Safety fallback: si por alguna razón quedamos en loading demasiado tiempo,
    // forzamos un nuevo chequeo para liberar el estado y evitar pantallas colgadas.
    const safety = setTimeout(async () => {
      try {
        if (typeof window !== 'undefined') {
          // solo si seguimos en loading, intentamos una segunda lectura
          // (usamos estado local actual via closure)
        }
        const currentUser = await authService.getCurrentUser()
        setUser(prev => prev ?? currentUser)
      } catch (e) {
        console.warn('Safety fallback auth check failed:', e)
      } finally {
        setLoading(false)
      }
    }, 3000)

    // Escuchar cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'has session' : 'no session')
        
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Mantener usuario en refrescos de token
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setLoading(false)
        } else if (session) {
          // Si hay sesión pero no es un evento específico, mantener usuario
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setLoading(false)
        } else {
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(safety)
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      await authService.signUp(email, password, fullName)
      // No redirigimos aquí: dejamos que la página de registro muestre el mensaje de
      // "Verifica tu email" y controle la navegación.
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
      // El usuario será actualizado automáticamente por el listener
      router.push('/cursos')
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Llamar al servicio de logout
      await authService.signOut()
      
      // Limpiar usuario después del logout exitoso
      setUser(null)
      
      // Mostrar mensaje de éxito
      showSuccess('Sesión cerrada correctamente')
      
      // Redirigir a la página principal
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      
      // Mostrar error específico
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión'
      showError(errorMessage)
      
      // Incluso si hay error, limpiamos el usuario localmente como fallback
      setUser(null)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const isEnrolledInCourse = async (courseId: string) => {
    return await authService.isEnrolledInCourse(courseId)
  }

  const enrollInCourse = async (courseId: string) => {
    await authService.enrollInCourse(courseId)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isEnrolledInCourse,
    enrollInCourse,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
