import { create } from 'zustand'
import type { SATQuestion, SATSection, SATDomain, Difficulty } from '@/types/sat'
import type { AnswerRecord } from '@/types/test'
import { chatCompletion } from '@/lib/fireworks'
import { buildQuestionPrompt } from '@/data/prompts/question-gen'
import { SAT_TOPICS } from '@/data/sat-domains'

interface PracticeState {
  // Config
  section: SATSection | null
  domain: SATDomain | null
  topicId: string | null
  difficulty: Difficulty

  // Session
  questions: SATQuestion[]
  currentIndex: number
  answers: AnswerRecord[]
  generating: boolean
  error: string | null

  // Actions
  setConfig: (config: { section?: SATSection; domain?: SATDomain; topicId?: string; difficulty?: Difficulty }) => void
  generateQuestions: (lang: 'en' | 'ko') => Promise<void>
  generateNextQuestion: (lang: 'en' | 'ko') => Promise<void>
  submitAnswer: (selectedAnswer: number, timeSpent: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  flagQuestion: () => void
  reset: () => void
  abortController: AbortController | null
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  section: null,
  domain: null,
  topicId: null,
  difficulty: 'medium',
  questions: [],
  currentIndex: 0,
  answers: [],
  generating: false,
  error: null,
  abortController: null,

  setConfig: (config) => set(config),

  generateQuestions: async (lang) => {
    const { section, domain, topicId, difficulty } = get()
    if (!section || !domain || !topicId) return

    const topic = SAT_TOPICS.find((t) => t.id === topicId)
    if (!topic) return

    // Abort previous
    get().abortController?.abort()
    const controller = new AbortController()
    set({ generating: true, error: null, questions: [], answers: [], currentIndex: 0, abortController: controller })

    try {
      const prompt = buildQuestionPrompt({
        section,
        domain,
        topicName: topic.name,
        difficulty,
        count: 1,
        lang,
      })

      const content = await chatCompletion(
        [{ role: 'user', content: prompt }],
        { maxTokens: 4096, temperature: 0.7, signal: controller.signal },
      )

      // Parse JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Failed to parse AI response')

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        stimulus: string
        passage?: string
        choices: { label: string; text: string }[]
        correctAnswer: number
        explanation: string
        explanationKo: string
        tags: string[]
      }>

      const q = parsed[0]
      if (!q) throw new Error('No question generated')

      const question: SATQuestion = {
        id: `practice-${Date.now()}-0`,
        section,
        domain,
        topicId,
        difficulty,
        passage: q.passage ?? undefined,
        stimulus: q.stimulus,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        explanationKo: q.explanationKo,
        tags: q.tags ?? [],
        createdAt: new Date().toISOString(),
      }

      const answer: AnswerRecord = {
        questionId: question.id,
        question,
        selectedAnswer: null,
        isCorrect: false,
        timeSpentSeconds: 0,
        flagged: false,
      }

      set({ questions: [question], answers: [answer], generating: false })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      set({ error: (err as Error).message, generating: false })
    }
  },

  generateNextQuestion: async (lang) => {
    const { section, domain, topicId, difficulty, questions, answers } = get()
    if (!section || !domain || !topicId) return

    const topic = SAT_TOPICS.find((t) => t.id === topicId)
    if (!topic) return

    get().abortController?.abort()
    const controller = new AbortController()
    set({ generating: true, error: null, abortController: controller })

    try {
      const prompt = buildQuestionPrompt({
        section,
        domain,
        topicName: topic.name,
        difficulty,
        count: 1,
        lang,
      })

      const content = await chatCompletion(
        [{ role: 'user', content: prompt }],
        { maxTokens: 4096, temperature: 0.7, signal: controller.signal },
      )

      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Failed to parse AI response')

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        stimulus: string
        passage?: string
        choices: { label: string; text: string }[]
        correctAnswer: number
        explanation: string
        explanationKo: string
        tags: string[]
      }>

      const q = parsed[0]
      if (!q) throw new Error('No question generated')

      const question: SATQuestion = {
        id: `practice-${Date.now()}-${questions.length}`,
        section,
        domain,
        topicId,
        difficulty,
        passage: q.passage ?? undefined,
        stimulus: q.stimulus,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        explanationKo: q.explanationKo,
        tags: q.tags ?? [],
        createdAt: new Date().toISOString(),
      }

      const answer: AnswerRecord = {
        questionId: question.id,
        question,
        selectedAnswer: null,
        isCorrect: false,
        timeSpentSeconds: 0,
        flagged: false,
      }

      set({
        questions: [...questions, question],
        answers: [...answers, answer],
        currentIndex: questions.length,
        generating: false,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      set({ error: (err as Error).message, generating: false })
    }
  },

  submitAnswer: (selectedAnswer, timeSpent) => {
    const { currentIndex, answers, questions } = get()
    const question = questions[currentIndex]
    if (!question) return

    const updated = [...answers]
    updated[currentIndex] = {
      ...updated[currentIndex]!,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      timeSpentSeconds: timeSpent,
    }
    set({ answers: updated })
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get()
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 })
  },

  flagQuestion: () => {
    const { currentIndex, answers } = get()
    const updated = [...answers]
    if (updated[currentIndex]) {
      updated[currentIndex] = { ...updated[currentIndex], flagged: !updated[currentIndex].flagged }
      set({ answers: updated })
    }
  },

  reset: () => {
    get().abortController?.abort()
    set({
      questions: [],
      currentIndex: 0,
      answers: [],
      generating: false,
      error: null,
      abortController: null,
    })
  },
}))
