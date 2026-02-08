import type { ModuleType, SATQuestion, TestScore } from './sat'

export type SessionType = 'practice' | 'mock'
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export interface TestSession {
  id: string
  userId: string
  type: SessionType
  status: SessionStatus
  currentModule: ModuleType
  modules: ModuleResult[]
  score: TestScore | null
  startedAt: string
  completedAt: string | null
}

export interface ModuleResult {
  moduleType: ModuleType
  answers: AnswerRecord[]
  correctCount: number
  totalCount: number
  timeSpentSeconds: number
}

export interface AnswerRecord {
  questionId: string
  question: SATQuestion
  selectedAnswer: number | null // 0-3 or null if skipped
  isCorrect: boolean
  timeSpentSeconds: number
  flagged: boolean
}
