import { create } from 'zustand'
import type { ModuleType, SATQuestion, TestScore, Difficulty, SATSection } from '@/types/sat'
import { MODULE_CONFIGS } from '@/types/sat'
import type { TestSession, ModuleResult, AnswerRecord } from '@/types/test'
import { routeToModule2 } from '@/lib/adaptive'
import { calculateSectionScore, calculateTestScore } from '@/lib/scoring'
import { chatCompletion } from '@/lib/fireworks'
import { buildQuestionPrompt } from '@/data/prompts/question-gen'
import { SAT_TOPICS } from '@/data/sat-domains'

type TestPhase = 'idle' | 'generating' | 'in_progress' | 'module_transition' | 'completed'

interface TestState {
  phase: TestPhase
  session: TestSession | null
  currentModule: ModuleType | null
  currentModuleQuestions: SATQuestion[]
  currentIndex: number
  answers: AnswerRecord[]
  moduleResults: ModuleResult[]
  score: TestScore | null
  error: string | null

  startMockTest: (lang: 'en' | 'ko') => Promise<void>
  submitAnswer: (selectedAnswer: number, timeSpent: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  flagQuestion: () => void
  submitModule: () => Promise<void>
  reset: () => void
}

async function generateModuleQuestions(
  moduleType: ModuleType,
  lang: 'en' | 'ko',
): Promise<SATQuestion[]> {
  const config = MODULE_CONFIGS[moduleType]
  const section = config.section
  const sectionTopics = SAT_TOPICS.filter((t) => t.section === section)
  const allQuestions: SATQuestion[] = []

  // Distribute questions across topics
  const questionsPerTopic = Math.ceil(config.questionCount / sectionTopics.length)
  const difficulty: Difficulty = config.difficulty === 'mixed' ? 'medium' : config.difficulty

  // Generate in batches by topic group
  const topicGroups = sectionTopics.slice(0, 4) // use 4 topics to get enough variety
  for (const topic of topicGroups) {
    const count = Math.min(questionsPerTopic, config.questionCount - allQuestions.length)
    if (count <= 0) break

    const prompt = buildQuestionPrompt({
      section,
      domain: topic.domain,
      topicName: topic.name,
      difficulty,
      count,
      lang,
    })

    const content = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { maxTokens: 4096, temperature: 0.7 },
    )

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue
      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        stimulus: string; passage?: string; choices: { label: string; text: string }[]
        correctAnswer: number; explanation: string; explanationKo: string; tags: string[]
      }>

      for (const [i, q] of parsed.entries()) {
        allQuestions.push({
          id: `mock-${moduleType}-${Date.now()}-${i}`,
          section: section as SATSection,
          domain: topic.domain,
          topicId: topic.id,
          difficulty,
          passage: q.passage ?? undefined,
          stimulus: q.stimulus,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          explanationKo: q.explanationKo ?? '',
          tags: q.tags ?? [],
          createdAt: new Date().toISOString(),
        })
      }
    } catch { /* skip parse failures */ }
  }

  return allQuestions.slice(0, config.questionCount)
}

export const useTestStore = create<TestState>((set, get) => ({
  phase: 'idle',
  session: null,
  currentModule: null,
  currentModuleQuestions: [],
  currentIndex: 0,
  answers: [],
  moduleResults: [],
  score: null,
  error: null,

  startMockTest: async (lang) => {
    set({ phase: 'generating', error: null, moduleResults: [], score: null })

    try {
      // Start with R&W Module 1
      const questions = await generateModuleQuestions('rw1', lang)
      if (questions.length === 0) throw new Error('Failed to generate questions')

      const answers: AnswerRecord[] = questions.map((q) => ({
        questionId: q.id,
        question: q,
        selectedAnswer: null,
        isCorrect: false,
        timeSpentSeconds: 0,
        flagged: false,
      }))

      set({
        phase: 'in_progress',
        currentModule: 'rw1',
        currentModuleQuestions: questions,
        currentIndex: 0,
        answers,
      })
    } catch (err) {
      set({ phase: 'idle', error: (err as Error).message })
    }
  },

  submitAnswer: (selectedAnswer, timeSpent) => {
    const { currentIndex, answers, currentModuleQuestions } = get()
    const question = currentModuleQuestions[currentIndex]
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
    const { currentIndex, currentModuleQuestions } = get()
    if (currentIndex < currentModuleQuestions.length - 1) {
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

  submitModule: async () => {
    const { currentModule, answers, moduleResults, currentModuleQuestions } = get()
    if (!currentModule) return

    const correctCount = answers.filter((a) => a.isCorrect).length
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpentSeconds, 0)

    const moduleResult: ModuleResult = {
      moduleType: currentModule,
      answers: [...answers],
      correctCount,
      totalCount: currentModuleQuestions.length,
      timeSpentSeconds: totalTime,
    }

    const allResults = [...moduleResults, moduleResult]

    // Determine next module
    const nextModule = getNextModule(currentModule, moduleResult)

    if (!nextModule) {
      // Test complete — calculate scores
      const rw1 = allResults.find((r) => r.moduleType === 'rw1')!
      const rw2 = allResults.find((r) => r.moduleType.startsWith('rw2'))!
      const math1 = allResults.find((r) => r.moduleType === 'math1')!
      const math2 = allResults.find((r) => r.moduleType.startsWith('math2'))!

      const rwScore = calculateSectionScore('rw', rw1, rw2)
      const mathScore = calculateSectionScore('math', math1, math2)
      const score = calculateTestScore(rwScore, mathScore)

      set({ phase: 'completed', moduleResults: allResults, score })
      return
    }

    // Transition to next module
    set({ phase: 'module_transition', moduleResults: allResults })
    await new Promise((r) => setTimeout(r, 2000)) // brief pause

    set({ phase: 'generating' })
    const questions = await generateModuleQuestions(nextModule, 'en')
    const newAnswers: AnswerRecord[] = questions.map((q) => ({
      questionId: q.id,
      question: q,
      selectedAnswer: null,
      isCorrect: false,
      timeSpentSeconds: 0,
      flagged: false,
    }))

    set({
      phase: 'in_progress',
      currentModule: nextModule,
      currentModuleQuestions: questions,
      currentIndex: 0,
      answers: newAnswers,
    })
  },

  reset: () => set({
    phase: 'idle',
    session: null,
    currentModule: null,
    currentModuleQuestions: [],
    currentIndex: 0,
    answers: [],
    moduleResults: [],
    score: null,
    error: null,
  }),
}))

function getNextModule(
  current: ModuleType,
  result: ModuleResult,
): ModuleType | null {
  switch (current) {
    case 'rw1':
      return routeToModule2('rw', result)
    case 'rw2-easy':
    case 'rw2-hard':
      return 'math1'
    case 'math1':
      return routeToModule2('math', result)
    case 'math2-easy':
    case 'math2-hard':
      return null // test complete
    default:
      return null
  }
}
