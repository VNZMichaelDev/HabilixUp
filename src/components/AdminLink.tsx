'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAuthService } from '@/lib/adminAuth'

interface AdminLinkProps {
  className?: string
  mobile?: boolean
  onClick?: () => void
}

export default function AdminLink({ className = '', mobile = false, onClick }: AdminLinkProps) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        console.log('AdminLink: No user found')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      console.log('AdminLink: Checking admin status for user:', user.email, user.id)
      
      // Verificación simplificada: si es el email correcto, es admin
      if (user.email === 'maikermicha15@gmail.com') {
        console.log('AdminLink: User is admin by email')
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // Si no es el email admin, verificar en la base de datos
      try {
        const adminStatus = await AdminAuthService.isAdmin(user.id)
        console.log('AdminLink: Admin status result:', adminStatus)
        setIsAdmin(adminStatus)
      } catch (error) {
        console.log('AdminLink: Error checking admin status, using email fallback')
        setIsAdmin(false)
      }
      
      setLoading(false)
    }

    checkAdmin()
  }, [user])

  // Mostrar temporalmente para debug
  if (loading) {
    return <span className="text-gray-500 text-xs">Verificando admin...</span>
  }

  if (!isAdmin) {
    return null
  }

  const baseClassName = mobile 
    ? "text-red-600 hover:text-red-700 transition-colors font-medium px-2 py-1"
    : "text-red-600 hover:text-red-700 transition-colors font-medium"

  return (
    <Link
      href="/admin/demo"
      className={`${baseClassName} ${className}`}
      onClick={onClick}
    >
      {mobile ? '🔧 Panel Admin (Demo)' : 'Admin Demo'}
    </Link>
  )
}
