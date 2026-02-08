import type { ModuleType, SATSection } from '@/types/sat'
import type { ModuleResult } from '@/types/test'

const ROUTING_THRESHOLD = 0.6 // 60% accuracy

/**
 * Determine Module 2 difficulty based on Module 1 performance.
 * Digital SAT adaptive routing:
 * - ≥ 60% correct → Hard module (score ceiling: 800)
 * - < 60% correct → Easy module (score ceiling: ~600)
 */
export function routeToModule2(
  section: SATSection,
  module1Result: ModuleResult,
): ModuleType {
  const accuracy = module1Result.correctCount / module1Result.totalCount

  if (section === 'rw') {
    return accuracy >= ROUTING_THRESHOLD ? 'rw2-hard' : 'rw2-easy'
  }
  return accuracy >= ROUTING_THRESHOLD ? 'math2-hard' : 'math2-easy'
}

/**
 * Get the sequence of modules for a full mock test.
 */
export function getTestModuleSequence(): ModuleType[] {
  // Module 2 types are determined at runtime after Module 1
  return ['rw1', 'math1']
}

/**
 * Check if this is a Module 1 type.
 */
export function isModule1(moduleType: ModuleType): boolean {
  return moduleType === 'rw1' || moduleType === 'math1'
}
