'use client'

import { showSuccess, showError, showWarning, showInfo } from '@/lib/notifications'

export default function TestNotificationsPage() {
  const testSuccess = () => {
    showSuccess('¡Curso creado exitosamente! 🎯')
  }

  const testError = () => {
    showError('Error al crear la lección. Por favor verifica los datos e intenta nuevamente.')
  }

  const testWarning = () => {
    showWarning('Advertencia: El título del curso ya existe. Considera usar un nombre diferente.')
  }

  const testInfo = () => {
    showInfo('Información: Recuerda que puedes agregar hasta 50 lecciones por curso.')
  }

  const testMultiple = () => {
    showInfo('Procesando solicitud...')
    setTimeout(() => showWarning('Verificando datos...'), 1000)
    setTimeout(() => showError('Error de conexión detectado'), 2000)
    setTimeout(() => showSuccess('¡Operación completada!'), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🎨 Prueba de Notificaciones Mejoradas
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notificación de Éxito */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ✅ Notificación de Éxito
              </h3>
              <p className="text-green-700 mb-4">
                Para cuando algo se completa correctamente
              </p>
              <button
                onClick={testSuccess}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Probar Éxito
              </button>
            </div>

            {/* Notificación de Error */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                🚨 Notificación de Error
              </h3>
              <p className="text-red-700 mb-4">
                Para errores y problemas que necesitan atención
              </p>
              <button
                onClick={testError}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Probar Error
              </button>
            </div>

            {/* Notificación de Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                ⚠️ Notificación de Advertencia
              </h3>
              <p className="text-yellow-700 mb-4">
                Para alertas y situaciones que requieren precaución
              </p>
              <button
                onClick={testWarning}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Probar Advertencia
              </button>
            </div>

            {/* Notificación de Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                💡 Notificación de Información
              </h3>
              <p className="text-blue-700 mb-4">
                Para consejos y información útil
              </p>
              <button
                onClick={testInfo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Probar Info
              </button>
            </div>
          </div>

          {/* Prueba Múltiple */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🎭 Prueba Múltiple
            </h3>
            <p className="text-gray-700 mb-4">
              Muestra varias notificaciones en secuencia
            </p>
            <button
              onClick={testMultiple}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Probar Secuencia
            </button>
          </div>

          {/* Instrucciones */}
          <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">
              📋 Características de las Notificaciones
            </h3>
            <ul className="text-indigo-700 space-y-2">
              <li>• <strong>Colores vibrantes:</strong> Cada tipo tiene su color distintivo</li>
              <li>• <strong>Iconos expresivos:</strong> Emojis que comunican el estado</li>
              <li>• <strong>Gradientes:</strong> Fondos con degradados atractivos</li>
              <li>• <strong>Bordes coloridos:</strong> Línea lateral que refuerza el tipo</li>
              <li>• <strong>Animaciones suaves:</strong> Entrada y salida con transiciones</li>
              <li>• <strong>Clickeable:</strong> Haz clic para cerrar manualmente</li>
              <li>• <strong>Auto-cierre:</strong> Se cierran automáticamente después de unos segundos</li>
            </ul>
          </div>

          {/* Navegación */}
          <div className="mt-8 text-center">
            <a
              href="/admin"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              ← Volver al Panel de Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
