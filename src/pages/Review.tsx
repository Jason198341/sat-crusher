import DOMPurify from 'dompurify'
import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { MathRenderer } from '@/components/common/MathRenderer'
import type { SATQuestion } from '@/types/sat'
import { sm2Update } from '@/lib/spaced-repetition'

interface ReviewCardState {
  question: SATQuestion
  easeFactor: number
  interval: number
  repetitions: number
  showAnswer: boolean
}

// Demo review items (in production these come from Supabase)
const DEMO_ITEMS: ReviewCardState[] = []

export function Review() {
  const { t, lang } = useUIStore()
  const [items, setItems] = useState<ReviewCardState[]>(DEMO_ITEMS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedToday, setCompletedToday] = useState(0)

  const currentItem = items[currentIndex]

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentItem) return

    const result = sm2Update(
      { easeFactor: currentItem.easeFactor, interval: currentItem.interval, repetitions: currentItem.repetitions },
      rating,
    )

    if (rating === 'again') {
      // Re-add to end of queue
      const updated = [...items]
      updated[currentIndex] = { ...currentItem, ...result, showAnswer: false }
      updated.push(updated.splice(currentIndex, 1)[0]!)
      setItems(updated)
    } else {
      // Remove from queue
      const updated = items.filter((_, i) => i !== currentIndex)
      setItems(updated)
      setCompletedToday((c) => c + 1)
    }

    if (currentIndex >= items.length - 1) setCurrentIndex(0)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">{t.review.title}</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-slate-400">{t.review.dueToday}: <strong className="text-white">{items.length}</strong></span>
          <span className="text-slate-400">{t.review.completed}: <strong className="text-success-400">{completedToday}</strong></span>
        </div>
      </div>

      {/* Usage Guide */}
      <div className="guide-card mb-8">
        <div className="guide-title">
          📖 {lang === 'ko' ? '복습 큐 사용법' : 'Review Queue Guide'}
        </div>
        <div className="space-y-1">
          {(lang === 'ko' ? [
            '틀린 문제는 자동으로 **복습 큐**에 추가됩니다',
            '**정답 보기**를 눌러 정답과 해설을 확인하세요',
            '난이도를 평가하면 **SM-2 알고리즘**이 다음 복습 시점을 계산합니다',
            '**쉬웠어요** → 간격이 크게 늘어남 / **다시 볼래요** → 오늘 다시 출제',
            '매일 복습 큐를 비우면 **장기 기억**에 정착됩니다',
          ] : [
            'Wrong answers are **auto-added** to the review queue',
            'Tap **Show Answer** to reveal the correct answer and explanation',
            'Rate difficulty and the **SM-2 algorithm** schedules the next review',
            '**Easy** → longer interval / **Again** → re-queued today',
            'Clear your daily queue to lock knowledge into **long-term memory**',
          ]).map((text, i) => (
            <p key={i} className="guide-step" dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
            }} />
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-lg text-slate-300">{t.review.noReviews}</p>
        </Card>
      ) : currentItem ? (
        <Card className="space-y-6">
          {/* Question */}
          <MathRenderer content={currentItem.question.stimulus} className="text-white leading-relaxed" />

          {/* Choices */}
          <div className="space-y-2">
            {currentItem.question.choices.map((choice, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  currentItem.showAnswer && i === currentItem.question.correctAnswer
                    ? 'border-success-500 bg-success-500/10'
                    : 'border-surface-border'
                }`}
              >
                <span className="text-sm text-slate-400 mr-2">{choice.label}.</span>
                <MathRenderer content={choice.text} className="inline text-sm text-slate-200" />
              </div>
            ))}
          </div>

          {!currentItem.showAnswer ? (
            <Button
              className="w-full"
              onClick={() => {
                const updated = [...items]
                updated[currentIndex] = { ...currentItem, showAnswer: true }
                setItems(updated)
              }}
            >
              {t.review.showAnswer}
            </Button>
          ) : (
            <div className="space-y-3">
              <MathRenderer
                content={currentItem.question.explanation}
                className="text-sm text-slate-300 bg-surface/50 rounded-lg p-4"
              />
              <div className="grid grid-cols-4 gap-2">
                <Button variant="danger" onClick={() => handleRate('again')}>{t.review.rateAgain}</Button>
                <Button variant="secondary" onClick={() => handleRate('hard')}>{t.review.rateHard}</Button>
                <Button onClick={() => handleRate('good')}>{t.review.rateGood}</Button>
                <Button variant="ghost" className="border border-success-500/30 text-success-400" onClick={() => handleRate('easy')}>
                  {t.review.rateEasy}
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  )
}
