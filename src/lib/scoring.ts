import type { ModuleResult, AnswerRecord } from '@/types/test'
import type { SATSection, SectionScore, DomainScore, TestScore, SATDomain } from '@/types/sat'

/**
 * Digital SAT scoring: raw → scaled (200-800 per section).
 * Uses a simplified piecewise linear approximation of the College Board curve.
 * Hard module = higher ceiling, Easy module = lower ceiling.
 */
export function calculateSectionScore(
  section: SATSection,
  module1: ModuleResult,
  module2: ModuleResult,
): SectionScore {
  const isHardModule = module2.moduleType.includes('hard')
  const totalCorrect = module1.correctCount + module2.correctCount
  const totalQuestions = module1.totalCount + module2.totalCount
  const rawPct = totalCorrect / totalQuestions

  // Scaled score mapping
  let scaled: number
  if (isHardModule) {
    // Hard path: 200-800 range
    scaled = Math.round(200 + rawPct * 600)
    scaled = Math.min(800, Math.max(200, scaled))
  } else {
    // Easy path: 200-~600 range (capped lower)
    scaled = Math.round(200 + rawPct * 420)
    scaled = Math.min(620, Math.max(200, scaled))
  }

  // Domain breakdown
  const allAnswers = [...module1.answers, ...module2.answers]
  const domains = computeDomainScores(allAnswers)

  return {
    section,
    scaled,
    correct: totalCorrect,
    total: totalQuestions,
    domains,
  }
}

function computeDomainScores(answers: AnswerRecord[]): DomainScore[] {
  const domainMap = new Map<SATDomain, { correct: number; total: number }>()

  for (const a of answers) {
    const d = a.question.domain
    const entry = domainMap.get(d) ?? { correct: 0, total: 0 }
    entry.total++
    if (a.isCorrect) entry.correct++
    domainMap.set(d, entry)
  }

  return Array.from(domainMap.entries()).map(([domain, { correct, total }]) => ({
    domain,
    correct,
    total,
    accuracy: total > 0 ? correct / total : 0,
  }))
}

export function calculateTestScore(rw: SectionScore, math: SectionScore): TestScore {
  return {
    total: rw.scaled + math.scaled,
    rw,
    math,
    date: new Date().toISOString(),
  }
}

/**
 * Predict score based on recent practice accuracy.
 * Simple weighted average of practice performance mapped to SAT scale.
 */
export function predictScore(
  rwAccuracy: number,
  mathAccuracy: number,
): number {
  const rwScaled = Math.round(200 + rwAccuracy * 600)
  const mathScaled = Math.round(200 + mathAccuracy * 600)
  return Math.min(1600, Math.max(400, rwScaled + mathScaled))
}
