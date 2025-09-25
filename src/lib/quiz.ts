import { createClientSupabaseClient } from './supabaseClient'

export type QuestionType = 'single' | 'multiple' | 'true_false' | 'short_text'

export interface LessonQuiz {
  id: string
  lesson_id: string
  title: string
  required_to_continue: boolean
  pass_score: number
}

export interface CourseExam {
  id: string
  course_id: string
  title: string
  required_for_certificate: boolean
  pass_score: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  order_index: number
  type: QuestionType
  text: string
  image_url?: string | null
  video_url?: string | null
  explanation?: string | null
}

export interface QuizOption {
  id: string
  question_id: string
  order_index: number
  text: string
  is_correct: boolean
}

export interface AttemptAnswer {
  question_id: string
  selected_option_ids?: string[]
  text_answer?: string
}

export class QuizService {
  private supabase = createClientSupabaseClient()

  // QUIZ (por lección)
  async getLessonQuiz(lessonId: string): Promise<LessonQuiz | null> {
    const { data } = await this.supabase
      .from('lesson_quizzes')
      .select('id, lesson_id, title, required_to_continue, pass_score')
      .eq('lesson_id', lessonId)
      .maybeSingle()
    return (data as any) || null
  }

  async getQuizQuestions(quizId: string): Promise<(QuizQuestion & { options: QuizOption[] })[]> {
    const { data: questions } = await this.supabase
      .from('quiz_questions')
      .select('id, quiz_id, order_index, type, text, image_url, video_url, explanation')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true })

    const qList = (questions as QuizQuestion[]) || []
    if (qList.length === 0) return []

    const ids = qList.map(q => q.id)
    const { data: options } = await this.supabase
      .from('quiz_options')
      .select('id, question_id, order_index, text, is_correct')
      .in('question_id', ids)
      .order('order_index', { ascending: true })

    const opts = (options as QuizOption[]) || []
    const byQuestion: Record<string, QuizOption[]> = {}
    for (const op of opts) {
      if (!byQuestion[op.question_id]) byQuestion[op.question_id] = []
      byQuestion[op.question_id].push(op)
    }

    return qList.map(q => ({ ...q, options: byQuestion[q.id] || [] }))
  }

  async getLastQuizAttempt(userId: string, quizId: string) {
    const { data } = await this.supabase
      .from('quiz_attempts')
      .select('id, score, passed, created_at')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data as { id: string; score: number; passed: boolean; created_at: string } | null
  }

  async submitQuizAttempt(userId: string, quizId: string, passScore: number, questions: (QuizQuestion & { options: QuizOption[] })[], answers: AttemptAnswer[]) {
    // calcular score
    let correct = 0
    for (const q of questions) {
      const ans = answers.find(a => a.question_id === q.id)
      if (!ans) continue

      if (q.type === 'single' || q.type === 'true_false') {
        const selected = ans.selected_option_ids?.[0]
        const ok = q.options.find(o => o.id === selected)?.is_correct
        if (ok) correct++
      } else if (q.type === 'multiple') {
        const selected = new Set(ans.selected_option_ids || [])
        const allCorrect = q.options.filter(o => o.is_correct).map(o => o.id)
        const allWrong = q.options.filter(o => !o.is_correct).map(o => o.id)
        const ok = allCorrect.every(id => selected.has(id)) && allWrong.every(id => !selected.has(id))
        if (ok) correct++
      } else if (q.type === 'short_text') {
        // Por ahora no se evalúa automáticamente, el instructor puede revisar manual
        // Consideramos incorrecto (0) por default
      }
    }

    const total = questions.length
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = score >= passScore

    const { error } = await this.supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score,
        passed,
        answers
      })
    if (error) throw error

    return { score, passed }
  }

  // EXAM (por curso)
  async getCourseExam(courseId: string): Promise<CourseExam | null> {
    const { data } = await this.supabase
      .from('course_exams')
      .select('id, course_id, title, required_for_certificate, pass_score')
      .eq('course_id', courseId)
      .maybeSingle()
    return (data as any) || null
  }

  async getExamQuestions(examId: string) {
    const { data: questions } = await this.supabase
      .from('exam_questions')
      .select('id, exam_id, order_index, type, text, image_url, video_url, explanation')
      .eq('exam_id', examId)
      .order('order_index', { ascending: true })

    // Mapear las filas de exam_questions al shape de QuizQuestion (reutilizamos quiz_id para mantener compatibilidad)
    const qList: QuizQuestion[] = ((questions as any[]) || []).map((q: any) => ({
      id: q.id,
      quiz_id: q.exam_id, // reutilizamos la propiedad para mantener el tipo esperado aguas abajo
      order_index: q.order_index,
      type: q.type,
      text: q.text,
      image_url: q.image_url,
      video_url: q.video_url,
      explanation: q.explanation,
    }))
    if (qList.length === 0) return []

    const ids = qList.map(q => q.id)
    const { data: options } = await this.supabase
      .from('exam_options')
      .select('id, question_id, order_index, text, is_correct')
      .in('question_id', ids)
      .order('order_index', { ascending: true })

    const opts = (options as QuizOption[]) || []
    const byQuestion: Record<string, QuizOption[]> = {}
    for (const op of opts) {
      if (!byQuestion[op.question_id]) byQuestion[op.question_id] = []
      byQuestion[op.question_id].push(op)
    }

    return qList.map(q => ({ ...q, options: byQuestion[q.id] || [] }))
  }

  async getLastExamAttempt(userId: string, examId: string) {
    const { data } = await this.supabase
      .from('exam_attempts')
      .select('id, score, passed, created_at')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data as { id: string; score: number; passed: boolean; created_at: string } | null
  }

  async submitExamAttempt(userId: string, examId: string, passScore: number, questions: (QuizQuestion & { options: QuizOption[] })[], answers: AttemptAnswer[]) {
    let correct = 0
    for (const q of questions) {
      const ans = answers.find(a => a.question_id === q.id)
      if (!ans) continue
      if (q.type === 'single' || q.type === 'true_false') {
        const selected = ans.selected_option_ids?.[0]
        const ok = q.options.find(o => o.id === selected)?.is_correct
        if (ok) correct++
      } else if (q.type === 'multiple') {
        const selected = new Set(ans.selected_option_ids || [])
        const allCorrect = q.options.filter(o => o.is_correct).map(o => o.id)
        const allWrong = q.options.filter(o => !o.is_correct).map(o => o.id)
        const ok = allCorrect.every(id => selected.has(id)) && allWrong.every(id => !selected.has(id))
        if (ok) correct++
      }
    }
    const total = questions.length
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = score >= passScore

    const { error } = await this.supabase
      .from('exam_attempts')
      .insert({ user_id: userId, exam_id: examId, score, passed, answers })
    if (error) throw error

    return { score, passed }
  }
}

export const quizService = new QuizService()
