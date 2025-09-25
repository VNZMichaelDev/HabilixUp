'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { paymentsService } from '@/lib/payments'
import { showError, showSuccess } from '@/lib/notifications'

interface PendingItem {
  id: string
  user_id: string
  course_id: string
  amount: number
  currency: string
  method: string
  reference: string | null
  paid_at: string | null
  receipt_url: string | null
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: { full_name?: string; email?: string } | null
  courses?: { title?: string; price?: number } | null
}

export default function AdminPagosPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PendingItem[]>([])
  const [workingId, setWorkingId] = useState<string | null>(null)

  const isAdmin = user?.profile?.role === 'admin'

  const load = async () => {
    try {
      setLoading(true)
      const data = await paymentsService.adminListPending()
      setItems(data as any)
    } catch (e) {
      console.error('Load pending payments error:', e)
      showError('Error cargando solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Pagos</h1>
        <p className="text-gray-600">Acceso restringido. Solo administradores.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Solicitudes de Pago Pendientes</h1>
        <button onClick={load} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Refrescar</button>
      </div>

      {loading ? (
        <div className="text-gray-600">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">No hay solicitudes pendientes.</div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const noteObj = (() => {
              try { return item.note ? JSON.parse(item.note) : null } catch { return null }
            })()
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-semibold">{item.courses?.title || 'Curso'}</div>
                    <div className="text-sm text-gray-600">{item.profiles?.full_name || 'Alumno'} • {item.profiles?.email || ''}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
                    {noteObj?.sentCapture && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">Capture recibido</span>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <div className="text-gray-500">Método</div>
                    <div className="font-medium">{item.method}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Precio Curso</div>
                    <div className="font-medium">{item.courses?.price ? `$${item.courses.price}` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fecha</div>
                    <div className="font-medium">{new Date(item.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {noteObj && (
                  <div className="mt-3 text-sm grid sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-gray-500">Nombre</div>
                      <div className="font-medium">{noteObj.fullName}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Cédula</div>
                      <div className="font-medium">{noteObj.idNumber}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Experiencia</div>
                      <div className="font-medium">{noteObj.hasExperience ? 'Sí' : 'No'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Método seleccionado</div>
                      <div className="font-medium capitalize">{(noteObj.method || item.method || '').replace('_', ' ')}</div>
                    </div>
                    {noteObj.method === 'pago_movil' && (
                      <div>
                        <div className="text-gray-500">Últimos 6 dígitos</div>
                        <div className="font-medium font-mono">{noteObj.last6digits || '-'}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-500">Capture</div>
                      <div className="font-medium">{noteObj.sentCapture ? 'Recibido por WhatsApp' : 'Pendiente'}</div>
                    </div>
                    {noteObj.experienceNotes && (
                      <div className="sm:col-span-3">
                        <div className="text-gray-500">Detalle</div>
                        <div className="font-medium">{noteObj.experienceNotes}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    disabled={workingId === item.id}
                    onClick={async () => {
                      try {
                        setWorkingId(item.id)
                        await paymentsService.approveRequest(item.id, user!.id)
                        showSuccess('Solicitud aprobada e inscripción creada')
                        await load()
                      } catch (e:any) {
                        console.error('Approve error:', e)
                        showError(e?.message || 'Error aprobando')
                      } finally {
                        setWorkingId(null)
                      }
                    }}
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {workingId === item.id ? 'Procesando…' : 'Aprobar'}
                  </button>
                  <button
                    disabled={workingId === item.id}
                    onClick={async () => {
                      try {
                        setWorkingId(item.id)
                        await paymentsService.rejectRequest(item.id, user!.id)
                        showSuccess('Solicitud rechazada')
                        await load()
                      } catch (e:any) {
                        console.error('Reject error:', e)
                        showError(e?.message || 'Error rechazando')
                      } finally {
                        setWorkingId(null)
                      }
                    }}
                    className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 disabled:opacity-60"
                  >
                    {workingId === item.id ? 'Procesando…' : 'Rechazar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
