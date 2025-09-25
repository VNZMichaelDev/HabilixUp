import { createClientSupabaseClient } from './supabaseClient'

export type PaymentMethod = 'pago_movil' | 'binance' | 'paypal'

export interface CreatePaymentRequestInput {
  userId: string
  courseId: string
  fullName: string
  idNumber: string // cédula
  hasExperience: boolean
  experienceNotes?: string
  method: PaymentMethod
  last6digits?: string
  sentCapture?: boolean
}

export class PaymentsService {
  private supabase = createClientSupabaseClient()

  async createPaymentRequest(input: CreatePaymentRequestInput) {
    const { userId, courseId, fullName, idNumber, hasExperience, experienceNotes, method, last6digits, sentCapture } = input

    const { error } = await this.supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: 0, // opcional; el precio del curso está en courses.price. Podemos dejar 0 aquí si no es requerido
        currency: 'USD',
        method,
        reference: null,
        paid_at: null,
        receipt_url: null,
        note: JSON.stringify({ fullName, idNumber, hasExperience, experienceNotes, method, last6digits, sentCapture }),
        status: 'pending'
      })

    if (error) throw error
  }

  async listMyPaymentRequests(userId: string) {
    const { data, error } = await this.supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // ADMIN: listar pendientes
  async adminListPending() {
    const { data, error } = await this.supabase
      .from('payment_requests')
      .select(`
        id,
        user_id,
        course_id,
        amount,
        currency,
        method,
        reference,
        paid_at,
        receipt_url,
        note,
        status,
        created_at,
        profiles:user_id ( full_name, email ),
        courses:course_id ( title, price )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  // ADMIN: aprobar solicitud -> crea enrollment si no existe
  async approveRequest(requestId: string, reviewerId: string) {
    // Obtener solicitud
    const { data: req, error: getErr } = await this.supabase
      .from('payment_requests')
      .select('id, user_id, course_id, status')
      .eq('id', requestId)
      .single()
    if (getErr) throw getErr

    if (!req) throw new Error('Solicitud no encontrada')
    if (req.status !== 'pending') throw new Error('La solicitud ya fue procesada')

    // Aprobar
    const { error: upErr } = await this.supabase
      .from('payment_requests')
      .update({ status: 'approved', reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq('id', requestId)
    if (upErr) throw upErr

    // Crear enrollment si no existe
    const { data: existing } = await this.supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', req.user_id)
      .eq('course_id', req.course_id)
      .maybeSingle()

    if (!existing) {
      const { error: insErr } = await this.supabase
        .from('enrollments')
        .insert({ user_id: req.user_id, course_id: req.course_id, progress: 0 })
      if (insErr) throw insErr
    }
  }

  // ADMIN: rechazar solicitud
  async rejectRequest(requestId: string, reviewerId: string) {
    const { error } = await this.supabase
      .from('payment_requests')
      .update({ status: 'rejected', reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq('id', requestId)
    if (error) throw error
  }
}

export const paymentsService = new PaymentsService()
