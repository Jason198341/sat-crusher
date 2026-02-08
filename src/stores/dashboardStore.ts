import { create } from 'zustand'
import type { TestScore, DomainScore, SATDomain } from '@/types/sat'
import type { DailyStats } from '@/types/user'
import { predictScore } from '@/lib/scoring'

interface DashboardState {
  scores: TestScore[]
  dailyStats: DailyStats[]
  domainAccuracies: Map<SATDomain, { correct: number; total: number }>
  reviewsDue: number

  addScore: (score: TestScore) => void
  addDailyStats: (stats: DailyStats) => void
  updateDomainAccuracy: (domain: SATDomain, correct: number, total: number) => void
  setReviewsDue: (count: number) => void
  getPredictedScore: () => number
  getWeakDomains: () => { domain: SATDomain; accuracy: number }[]
  recordPracticeResults: (answers: Array<{ domain: SATDomain; isCorrect: boolean }>) => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  scores: [],
  dailyStats: [],
  domainAccuracies: new Map(),
  reviewsDue: 0,

  addScore: (score) => set((s) => ({ scores: [...s.scores, score] })),

  addDailyStats: (stats) => set((s) => ({ dailyStats: [...s.dailyStats, stats] })),

  updateDomainAccuracy: (domain, correct, total) => {
    set((s) => {
      const map = new Map(s.domainAccuracies)
      const prev = map.get(domain) ?? { correct: 0, total: 0 }
      map.set(domain, { correct: prev.correct + correct, total: prev.total + total })
      return { domainAccuracies: map }
    })
  },

  setReviewsDue: (count) => set({ reviewsDue: count }),

  getPredictedScore: () => {
    const { domainAccuracies } = get()
    let rwCorrect = 0, rwTotal = 0, mathCorrect = 0, mathTotal = 0

    const rwDomains = new Set(['craft-structure', 'information-ideas', 'standard-english', 'expression-of-ideas'])

    for (const [domain, { correct, total }] of domainAccuracies) {
      if (rwDomains.has(domain)) {
        rwCorrect += correct
        rwTotal += total
      } else {
        mathCorrect += correct
        mathTotal += total
      }
    }

    const rwAcc = rwTotal > 0 ? rwCorrect / rwTotal : 0.5
    const mathAcc = mathTotal > 0 ? mathCorrect / mathTotal : 0.5
    return predictScore(rwAcc, mathAcc)
  },

  getWeakDomains: () => {
    const { domainAccuracies } = get()
    const results: { domain: SATDomain; accuracy: number }[] = []

    for (const [domain, { correct, total }] of domainAccuracies) {
      if (total >= 3) {
        results.push({ domain, accuracy: correct / total })
      }
    }

    return results.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5)
  },

  recordPracticeResults: (answers) => {
    for (const { domain, isCorrect } of answers) {
      get().updateDomainAccuracy(domain, isCorrect ? 1 : 0, 1)
    }
  },
}))
