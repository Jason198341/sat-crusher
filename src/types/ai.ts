export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface GenerateQuestionRequest {
  section: 'rw' | 'math'
  domain: string
  topicId: string
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  lang: 'en' | 'ko'
}

export interface StreamingState {
  isStreaming: boolean
  content: string
  error: string | null
}

// ─── 벼락 깨달음 Tutoring Types ──────────────

export type TutorModeType =
  | 'free'
  | 'byeorak'
  | 'dna-guide'
  | 'passage-strategy'
  | 'speed-run'
  | 'analysis-run'
  | 'weakness-run'
  | 'vocabulary'

/** Tracks how often a student falls for each 오답 DNA trap type */
export interface DNAProfile {
  /** Map of DNA id → { encountered, fellFor } */
  traps: Record<string, { encountered: number; fellFor: number }>
  /** Total questions analyzed */
  totalAnalyzed: number
  /** Last updated */
  lastUpdated: string
}

/** Metadata parsed from AI 벼락 해설 responses */
export interface ByeorakMeta {
  questionType?: string
  wrongAnswerDNA?: string[]
  passageType?: string
  difficulty?: string
  threeSecondFormula?: string
}

/** Simulation session report parsed from AI */
export interface SimulationReport {
  totalQuestions: number
  correctCount: number
  accuracy: number
  topDNA: string[]
  improvement: string
  recommendedFocus: string
}
