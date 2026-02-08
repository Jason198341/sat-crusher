export interface Profile {
  id: string
  email: string
  displayName: string
  targetScore: number
  testDate: string | null
  streak: number
  lastActiveDate: string | null
  lang: 'en' | 'ko'
  createdAt: string
}

export interface DailyStats {
  date: string
  questionsAttempted: number
  questionsCorrect: number
  timeSpentMinutes: number
  testsCompleted: number
}

export interface ReviewItem {
  id: string
  questionId: string
  userId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewDate: string
}
