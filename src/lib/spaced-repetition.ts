import type { ReviewItem } from '@/types/user'

type Rating = 'again' | 'hard' | 'good' | 'easy'

const RATING_QUALITY: Record<Rating, number> = {
  again: 0,
  hard: 2,
  good: 3,
  easy: 5,
}

/**
 * SM-2 Spaced Repetition Algorithm.
 * Updates ease factor, interval, and repetitions based on user rating.
 */
export function sm2Update(
  item: Pick<ReviewItem, 'easeFactor' | 'interval' | 'repetitions'>,
  rating: Rating,
): { easeFactor: number; interval: number; repetitions: number; nextReviewDate: string } {
  const q = RATING_QUALITY[rating]
  let { easeFactor, interval, repetitions } = item

  if (q < 3) {
    // Failed — reset
    repetitions = 0
    interval = 1
  } else {
    repetitions++
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = Math.max(1.3, easeFactor)

  // Calculate next review date
  const next = new Date()
  next.setDate(next.getDate() + interval)
  const nextReviewDate = next.toISOString().split('T')[0]!

  return { easeFactor, interval, repetitions, nextReviewDate }
}

/**
 * Create a new review item for a question the user got wrong.
 */
export function createReviewItem(questionId: string, userId: string): Omit<ReviewItem, 'id'> {
  const today = new Date().toISOString().split('T')[0]!
  return {
    questionId,
    userId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: today,
    lastReviewDate: today,
  }
}
