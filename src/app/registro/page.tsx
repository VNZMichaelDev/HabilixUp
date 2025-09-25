'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.name)
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <Image
              src="/logo.png"
              alt="HabilixUp Logo"
              width={60}
              height={60}
              className="sm:w-20 sm:h-20"
            />
          </Link>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">¡Cuenta creada exitosamente!</h3>
                <p className="text-sm">
                  Hemos enviado un enlace de verificación a <strong>{formData.email}</strong>.
                  Por favor, revisa tu correo electrónico (incluye la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
                </p>
              </div>
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres con al menos una mayúscula y un número
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                ¿Cómo planeas usar HabilixUp?
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="student">Estudiante - Quiero aprender nuevas habilidades</option>
                  <option value="professional">Profesional - Quiero avanzar en mi carrera</option>
                  <option value="business">Empresa - Quiero capacitar a mi equipo</option>
                  <option value="instructor">Instructor - Quiero enseñar cursos</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Acepto los{' '}
                <Link href="/terminos" className="text-blue-600 hover:text-blue-500">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="text-blue-600 hover:text-blue-500">
                  política de privacidad
                </Link>
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                Quiero recibir noticias y ofertas especiales por email
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>

          {/* Social registration eliminado intencionalmente */}
            </>
          )}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
