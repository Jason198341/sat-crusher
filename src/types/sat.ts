// ─── SAT Domain & Topic Types ────────────────

export type SATSection = 'rw' | 'math'

export type RWDomain =
  | 'craft-structure'
  | 'information-ideas'
  | 'standard-english'
  | 'expression-of-ideas'

export type MathDomain =
  | 'algebra'
  | 'advanced-math'
  | 'problem-solving'
  | 'geometry-trig'

export type SATDomain = RWDomain | MathDomain

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface SATTopic {
  id: string
  section: SATSection
  domain: SATDomain
  name: string
  nameKo: string
  description: string
}

// ─── Question Types ──────────────────────────

export interface SATQuestion {
  id: string
  section: SATSection
  domain: SATDomain
  topicId: string
  difficulty: Difficulty
  passage?: string
  stimulus: string
  choices: Choice[]
  correctAnswer: number // 0-3 index
  explanation: string
  explanationKo: string
  tags: string[]
  createdAt: string
}

export interface Choice {
  label: string // A, B, C, D
  text: string
}

// ─── Module / Adaptive Test ──────────────────

export type ModuleType = 'rw1' | 'rw2-easy' | 'rw2-hard' | 'math1' | 'math2-easy' | 'math2-hard'

export interface ModuleConfig {
  type: ModuleType
  section: SATSection
  questionCount: number
  timeLimitMinutes: number
  difficulty: Difficulty | 'mixed'
}

export const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  'rw1':        { type: 'rw1',        section: 'rw',   questionCount: 27, timeLimitMinutes: 32, difficulty: 'mixed' },
  'rw2-easy':   { type: 'rw2-easy',   section: 'rw',   questionCount: 27, timeLimitMinutes: 32, difficulty: 'easy' },
  'rw2-hard':   { type: 'rw2-hard',   section: 'rw',   questionCount: 27, timeLimitMinutes: 32, difficulty: 'hard' },
  'math1':      { type: 'math1',      section: 'math', questionCount: 22, timeLimitMinutes: 35, difficulty: 'mixed' },
  'math2-easy': { type: 'math2-easy', section: 'math', questionCount: 22, timeLimitMinutes: 35, difficulty: 'easy' },
  'math2-hard': { type: 'math2-hard', section: 'math', questionCount: 22, timeLimitMinutes: 35, difficulty: 'hard' },
}

// ─── Scoring ─────────────────────────────────

export interface SectionScore {
  section: SATSection
  scaled: number // 200-800
  correct: number
  total: number
  domains: DomainScore[]
}

export interface DomainScore {
  domain: SATDomain
  correct: number
  total: number
  accuracy: number
}

export interface TestScore {
  total: number // 400-1600
  rw: SectionScore
  math: SectionScore
  date: string
}
