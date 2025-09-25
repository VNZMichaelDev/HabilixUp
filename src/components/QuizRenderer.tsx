'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import { quizService, type QuizOption, type QuizQuestion } from '@/lib/quiz'
import { useAuth } from '@/contexts/AuthContext'
import { showError, showSuccess } from '@/lib/notifications'

interface Props {
  quizId: string
  onAttempt?: (result: { score: number; passed: boolean }) => void
  onPassed?: () => void
}

export default function QuizRenderer({ quizId, onAttempt, onPassed }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState<(QuizQuestion & { options: QuizOption[] })[]>([])
  const [passScore, setPassScore] = useState(70)
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({})
  const [lastResult, setLastResult] = useState<{ score: number; passed: boolean } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const qs = await quizService.getQuizQuestions(quizId)
        setQuestions(qs)
        // obtener passScore del quiz
        // pequeña trampa: getLessonQuiz no recibe quizId, así que asumimos 70 por defecto si no viene de fuera
        setPassScore(70)
      } catch (e) {
        console.error('Load quiz error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [quizId])

  const toggleOption = (qid: string, oid: string, multiple: boolean) => {
    setAnswers(prev => {
      if (multiple) {
        const set = new Set<string>(Array.isArray(prev[qid]) ? (prev[qid] as string[]) : [])
        if (set.has(oid)) {
          set.delete(oid)
        } else {
          set.add(oid)
        }
        return { ...prev, [qid]: Array.from(set) }
      } else {
        return { ...prev, [qid]: [oid] }
      }
    })
  }

  const submit = async () => {
    if (!user?.id) {
      showError('Debes iniciar sesión')
      return
    }
    try {
      setSubmitting(true)
      const flatAnswers = Object.entries(answers).map(([question_id, val]) => ({
        question_id,
        selected_option_ids: Array.isArray(val) ? val : (typeof val === 'string' ? [val] : []),
      }))
      const res = await quizService.submitQuizAttempt(user.id, quizId, passScore, questions, flatAnswers as any)
      setLastResult(res)
      onAttempt?.(res)
      if (res.passed) {
        showSuccess('¡Aprobado!')
        onPassed?.()
      } else {
        showError(`Puntaje ${res.score}%. Debes alcanzar ${passScore}%`)
      }
    } catch (e:any) {
      console.error('Submit quiz error:', e)
      showError(e?.message || 'Error enviando quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-gray-600">Cargando evaluación...</div>
  if (questions.length === 0) return <div className="text-gray-600">No hay preguntas para esta evaluación.</div>

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Evaluación</h3>
      <p className="text-sm text-gray-600 mb-4">Debes alcanzar al menos {passScore}%.</p>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const multiple = q.type === 'multiple'
          const selected = answers[q.id]
          return (
            <div key={q.id} className="">
              <div className="font-medium mb-1">{idx + 1}. {q.text}</div>
              {(q.image_url || q.video_url) && (
                <div className="mb-2 space-y-2">
                  {q.image_url && <img src={q.image_url} alt="quiz" className="max-h-64 rounded" />}
                  {q.video_url && (
                    <div className="aspect-video">
                      <iframe className="w-full h-full rounded" src={q.video_url} allowFullScreen />
                    </div>
                  )}
                </div>
              )}

              {q.type === 'short_text' ? (
                <input
                  className="w-full border rounded px-3 py-2"
                  value={typeof selected === 'string' ? (selected as string) : ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Tu respuesta"
                />
              ) : (
                <div className="space-y-2">
                  {q.options.map(op => {
                    const isChecked = Array.isArray(selected) ? (selected as string[]).includes(op.id) : selected === op.id
                    return (
                      <label key={op.id} className="flex items-center gap-2">
                        <input
                          type={multiple ? 'checkbox' : 'radio'}
                          name={q.id}
                          checked={!!isChecked}
                          onChange={() => toggleOption(q.id, op.id, multiple)}
                        />
                        <span>{op.text}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {q.explanation && (
                <div className="mt-2 text-xs text-gray-500">Sugerencia: {q.explanation}</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <button disabled={submitting} onClick={submit} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60">
          {submitting ? 'Enviando…' : 'Enviar respuestas'}
        </button>
        {lastResult && (
          <span className="ml-3 text-sm text-gray-700">Resultado: {lastResult.score}% • {lastResult.passed ? 'Aprobado' : 'No aprobado'}</span>
        )}
      </div>
    </div>
  )
}
