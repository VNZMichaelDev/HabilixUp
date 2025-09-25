'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { quizService, type QuestionType } from '@/lib/quiz'
import { showError, showSuccess } from '@/lib/notifications'

interface Exam {
  id: string
  course_id: string
  title: string
  required_for_certificate: boolean
  pass_score: number
}

export default function AdminCourseExamPage() {
  const { user } = useAuth()
  const params = useParams()
  const courseId = params.id as string
  const supabase = createClientSupabaseClient()

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [exam, setExam] = useState<Exam | null>(null)
  const [title, setTitle] = useState('Examen Final')
  const [required, setRequired] = useState(true)
  const [pass, setPass] = useState(70)

  const [questions, setQuestions] = useState<any[]>([])
  const [editing, setEditing] = useState<{ [qid: string]: boolean }>({})

  useEffect(() => {
    if (!user) return
    setIsAdmin(user?.profile?.role === 'admin')
  }, [user])

  const load = async () => {
    try {
      setLoading(true)
      const e = await quizService.getCourseExam(courseId)
      if (e) {
        setExam(e as any)
        setTitle(e.title)
        setRequired(!!e.required_for_certificate)
        setPass(e.pass_score)
        const qs = await quizService.getExamQuestions(e.id)
        setQuestions(qs)
      } else {
        setExam(null)
        setQuestions([])
      }
    } catch (e) {
      console.error('Load exam admin error:', e)
      showError('Error cargando examen')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin])

  const createOrUpdateExam = async () => {
    if (!isAdmin) return
    try {
      setSaving(true)
      if (!exam) {
        const { data, error } = await supabase
          .from('course_exams')
          .insert({ course_id: courseId, title, required_for_certificate: required, pass_score: pass })
          .select('id')
          .single()
        if (error) throw error
        setExam({ id: data!.id, course_id: courseId, title, required_for_certificate: required, pass_score: pass })
        showSuccess('Examen creado')
      } else {
        const { error } = await supabase
          .from('course_exams')
          .update({ title, required_for_certificate: required, pass_score: pass })
          .eq('id', exam.id)
        if (error) throw error
        showSuccess('Examen actualizado')
      }
      await load()
    } catch (e:any) {
      console.error('Save exam error:', e)
      showError(e?.message || 'Error guardando cambios')
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = async () => {
    if (!exam) { showError('Crea el examen primero'); return }
    try {
      const order_index = (questions[questions.length - 1]?.order_index || 0) + 1
      const { data, error } = await supabase
        .from('exam_questions')
        .insert({ exam_id: exam.id, order_index, type: 'single', text: 'Nueva pregunta' })
        .select('id, exam_id, order_index, type, text')
        .single()
      if (error) throw error
      // Crear dos opciones por defecto
      const baseOptions = [
        { question_id: data!.id, order_index: 1, text: 'Opción A', is_correct: true },
        { question_id: data!.id, order_index: 2, text: 'Opción B', is_correct: false },
      ]
      const { data: createdOptions } = await supabase
        .from('exam_options')
        .insert(baseOptions)
        .select('id, question_id, order_index, text, is_correct')
      setQuestions([...questions, { ...data, options: createdOptions || [] }])
      setEditing(prev => ({ ...prev, [data!.id]: true }))
    } catch (e:any) {
      console.error('Add question error:', e)
      showError(e?.message || 'Error creando pregunta')
    }
  }

  // Debounce helpers to avoid DB writes per keystroke
  const questionTimers = useRef<Record<string, any>>({})
  const optionTimers = useRef<Record<string, any>>({})

  const updateQuestionImmediate = async (qid: string, patch: Partial<{ text: string; type: QuestionType; image_url: string | null; video_url: string | null }>) => {
    const { error } = await supabase
      .from('exam_questions')
      .update(patch)
      .eq('id', qid)
    if (error) throw error
  }

  const updateQuestion = async (qid: string, patch: Partial<{ text: string; type: QuestionType; image_url: string | null; video_url: string | null }>) => {
    // Optimistic local update
    setQuestions(qs => qs.map(q => q.id === qid ? { ...q, ...patch } : q))
    // Debounce server write
    if (questionTimers.current[qid]) clearTimeout(questionTimers.current[qid])
    questionTimers.current[qid] = setTimeout(async () => {
      try {
        await updateQuestionImmediate(qid, patch)
      } catch (e:any) {
        console.error('Update question error:', e)
        showError(e?.message || 'Error actualizando pregunta')
      }
    }, 400)
  }

  const deleteQuestion = async (qid: string) => {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', qid)
      if (error) throw error
      setQuestions(qs => qs.filter(q => q.id !== qid))
      showSuccess('Pregunta eliminada')
    } catch (e:any) {
      console.error('Delete question error:', e)
      showError(e?.message || 'Error eliminando pregunta')
    }
  }

  const addOption = async (qid: string) => {
    try {
      const q = questions.find(x => x.id === qid)
      const order_index = ((q?.options?.[q.options.length - 1]?.order_index) || 0) + 1
      const { data, error } = await supabase
        .from('exam_options')
        .insert({ question_id: qid, order_index, text: 'Nueva opción', is_correct: false })
        .select('id, question_id, order_index, text, is_correct')
        .single()
      if (error) throw error
      setQuestions(qs => qs.map(qq => qq.id === qid ? { ...qq, options: [...(qq.options || []), data] } : qq))
    } catch (e:any) {
      console.error('Add option error:', e)
      showError(e?.message || 'Error creando opción')
    }
  }

  const updateOptionImmediate = async (oid: string, patch: Partial<{ text: string; is_correct: boolean }>) => {
    const { error } = await supabase
      .from('exam_options')
      .update(patch)
      .eq('id', oid)
    if (error) throw error
  }

  const updateOption = async (oid: string, patch: Partial<{ text: string; is_correct: boolean }>) => {
    // Optimistic local update
    setQuestions(qs => qs.map(q => ({ ...q, options: q.options.map((op:any) => op.id === oid ? { ...op, ...patch } : op) })))
    // Debounce server write
    if (optionTimers.current[oid]) clearTimeout(optionTimers.current[oid])
    optionTimers.current[oid] = setTimeout(async () => {
      try {
        await updateOptionImmediate(oid, patch)
      } catch (e:any) {
        console.error('Update option error:', e)
        showError(e?.message || 'Error actualizando opción')
      }
    }, 400)
  }

  const deleteOption = async (oid: string) => {
    try {
      const { error } = await supabase
        .from('exam_options')
        .delete()
        .eq('id', oid)
      if (error) throw error
      setQuestions(qs => qs.map(q => ({ ...q, options: q.options.filter((op:any) => op.id !== oid) })))
    } catch (e:any) {
      console.error('Delete option error:', e)
      showError(e?.message || 'Error eliminando opción')
    }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Examen del Curso</h1>
        <p className="text-gray-600">Acceso restringido a administradores.</p>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Examen del Curso</h1>
        <button onClick={load} className="px-4 py-2 rounded border hover:bg-gray-50">Refrescar</button>
      </div>

      <section className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Título</label>
            <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Puntaje mínimo (%)</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={pass} onChange={e => setPass(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
          </div>
          <div className="flex items-center gap-2">
            <input id="req" type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
            <label htmlFor="req">Requerido para certificado</label>
          </div>
        </div>
        <div className="mt-3">
          <button disabled={saving} onClick={createOrUpdateExam} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-60">
            {saving ? 'Guardando…' : (exam ? 'Actualizar' : 'Crear examen')}
          </button>
        </div>
      </section>

      {exam && (
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Preguntas</h2>
            <button onClick={addQuestion} className="px-3 py-2 rounded border hover:bg-gray-50">Añadir pregunta</button>
          </div>

          <div className="space-y-4">
            {questions.map((q:any, idx:number) => (
              <div key={q.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">#{idx + 1}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(prev => ({ ...prev, [q.id]: !prev[q.id] }))} className="text-sm px-2 py-1 rounded border">{editing[q.id] ? 'Cerrar' : 'Editar'}</button>
                    <button onClick={() => deleteQuestion(q.id)} className="text-sm px-2 py-1 rounded border text-rose-600">Eliminar</button>
                  </div>
                </div>

                {editing[q.id] ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Enunciado</label>
                      <textarea className="w-full border rounded px-3 py-2" value={q.text || ''} onChange={e => updateQuestion(q.id, { text: e.target.value })} />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">Tipo</label>
                        <select className="w-full border rounded px-3 py-2" value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value as QuestionType })}>
                          <option value="single">Opción única</option>
                          <option value="multiple">Selección múltiple</option>
                          <option value="true_false">Verdadero/Falso</option>
                          <option value="short_text">Respuesta corta</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Imagen (URL)</label>
                        <input className="w-full border rounded px-3 py-2" value={q.image_url || ''} onChange={e => updateQuestion(q.id, { image_url: e.target.value || null })} />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Video (URL)</label>
                        <input className="w-full border rounded px-3 py-2" value={q.video_url || ''} onChange={e => updateQuestion(q.id, { video_url: e.target.value || null })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{q.text}</div>
                )}

                {/* Opciones */}
                {q.type !== 'short_text' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Opciones</div>
                      <button onClick={() => addOption(q.id)} className="text-sm px-2 py-1 rounded border">Añadir opción</button>
                    </div>
                    <div className="space-y-2">
                      {q.options?.map((op:any) => (
                        <div key={op.id} className="flex items-center gap-2">
                          <input
                            type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                            checked={!!op.is_correct}
                            onChange={(e) => updateOption(op.id, { is_correct: e.target.checked })}
                          />
                          <input className="flex-1 border rounded px-3 py-1" value={op.text} onChange={e => updateOption(op.id, { text: e.target.value })} />
                          <button onClick={() => deleteOption(op.id)} className="text-xs px-2 py-1 rounded border">Eliminar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
