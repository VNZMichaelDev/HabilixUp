'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClientSupabaseClient } from '@/lib/supabaseClient'
import { showError, showSuccess } from '@/lib/notifications'
import type { QuestionType } from '@/lib/quiz'

interface Quiz {
  id: string
  lesson_id: string
  title: string
  required_to_continue: boolean
  pass_score: number
}

export default function AdminLessonQuizPage() {
  const { user } = useAuth()
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lessonId as string
  const supabase = createClientSupabaseClient()

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [title, setTitle] = useState('Quiz')
  const [required, setRequired] = useState(true)
  const [pass, setPass] = useState(70)

  const [questions, setQuestions] = useState<any[]>([])
  const [editing, setEditing] = useState<{ [qid: string]: boolean }>({})

  useEffect(() => {
    if (user) setIsAdmin(user.profile?.role === 'admin')
  }, [user])

  const load = async () => {
    try {
      setLoading(true)
      // cargar/crear quiz
      const { data: q } = await supabase
        .from('lesson_quizzes')
        .select('id, lesson_id, title, required_to_continue, pass_score')
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (q) {
        setQuiz(q as any)
        setTitle(q.title)
        setRequired(!!q.required_to_continue)
        setPass(q.pass_score)
        const { data: qs } = await supabase
          .from('quiz_questions')
          .select('id, quiz_id, order_index, type, text, image_url, video_url, explanation')
          .eq('quiz_id', q.id)
          .order('order_index', { ascending: true })
        const ids = (qs || []).map((x:any) => x.id)
        const { data: ops } = await supabase
          .from('quiz_options')
          .select('id, question_id, order_index, text, is_correct')
          .in('question_id', ids)
          .order('order_index', { ascending: true })
        const grouped: any = {};
        (ops || []).forEach((op:any) => { if (!grouped[op.question_id]) grouped[op.question_id] = []; grouped[op.question_id].push(op) })
        setQuestions((qs || []).map((qq:any) => ({ ...qq, options: grouped[qq.id] || [] })))
      } else {
        setQuiz(null)
        setQuestions([])
      }
    } catch (e) {
      console.error('Load lesson quiz error:', e)
      showError('Error cargando quiz')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin])

  const createOrUpdateQuiz = async () => {
    try {
      setSaving(true)
      if (!quiz) {
        const { data, error } = await supabase
          .from('lesson_quizzes')
          .insert({ lesson_id: lessonId, title, required_to_continue: required, pass_score: pass })
          .select('id')
          .single()
        if (error) throw error
        setQuiz({ id: data!.id, lesson_id: lessonId, title, required_to_continue: required, pass_score: pass })
        showSuccess('Quiz creado')
      } else {
        const { error } = await supabase
          .from('lesson_quizzes')
          .update({ title, required_to_continue: required, pass_score: pass })
          .eq('id', quiz.id)
        if (error) throw error
        showSuccess('Quiz actualizado')
      }
      await load()
    } catch (e:any) {
      console.error('Save quiz error:', e)
      showError(e?.message || 'Error guardando quiz')
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = async () => {
    if (!quiz) { showError('Crea el quiz primero'); return }
    try {
      const order_index = (questions[questions.length - 1]?.order_index || 0) + 1
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({ quiz_id: quiz.id, order_index, type: 'single', text: 'Nueva pregunta' })
        .select('id, quiz_id, order_index, type, text')
        .single()
      if (error) throw error
      setQuestions([...questions, { ...data, options: [] }])
      setEditing(prev => ({ ...prev, [data!.id]: true }))
    } catch (e:any) {
      console.error('Add question error:', e)
      showError(e?.message || 'Error creando pregunta')
    }
  }

  // Debounce helpers to avoid DB writes per keystroke
  const qTimers = useRef<Record<string, any>>({})
  const oTimers = useRef<Record<string, any>>({})

  const updateQuestionImmediate = async (qid: string, patch: Partial<{ text: string; type: QuestionType; image_url: string | null; video_url: string | null; explanation: string | null }>) => {
    const { error } = await supabase
      .from('quiz_questions')
      .update(patch)
      .eq('id', qid)
    if (error) throw error
  }

  const updateQuestion = async (qid: string, patch: Partial<{ text: string; type: QuestionType; image_url: string | null; video_url: string | null; explanation: string | null }>) => {
    // Optimistic update
    setQuestions(qs => qs.map(q => q.id === qid ? { ...q, ...patch } : q))
    if (qTimers.current[qid]) clearTimeout(qTimers.current[qid])
    qTimers.current[qid] = setTimeout(async () => {
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
        .from('quiz_questions')
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
        .from('quiz_options')
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
      .from('quiz_options')
      .update(patch)
      .eq('id', oid)
    if (error) throw error
  }

  const updateOption = async (oid: string, patch: Partial<{ text: string; is_correct: boolean }>) => {
    // Optimistic update
    setQuestions(qs => qs.map(q => ({ ...q, options: q.options.map((op:any) => op.id === oid ? { ...op, ...patch } : op) })))
    if (oTimers.current[oid]) clearTimeout(oTimers.current[oid])
    oTimers.current[oid] = setTimeout(async () => {
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
        .from('quiz_options')
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
        <h1 className="text-2xl font-bold">Quiz de la Lección</h1>
        <p className="text-gray-600">Acceso restringido a administradores.</p>
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz de la Lección</h1>
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
            <label htmlFor="req">Requerido para avanzar</label>
          </div>
        </div>
        <div className="mt-3">
          <button disabled={saving} onClick={createOrUpdateQuiz} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-60">
            {saving ? 'Guardando…' : (quiz ? 'Actualizar' : 'Crear quiz')}
          </button>
        </div>
      </section>

      {quiz && (
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
                    <div className="grid sm:grid-cols-4 gap-3">
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
                      <div>
                        <label className="text-sm text-gray-600">Explicación/feedback</label>
                        <input className="w-full border rounded px-3 py-2" value={q.explanation || ''} onChange={e => updateQuestion(q.id, { explanation: e.target.value || null })} />
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
