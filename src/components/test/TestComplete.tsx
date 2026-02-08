import type { TestScore } from '@/types/sat'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useUIStore } from '@/stores/uiStore'

interface TestCompleteProps {
  score: TestScore
  onViewResults: () => void
  onBackToDashboard: () => void
}

export function TestComplete({ score, onViewResults, onBackToDashboard }: TestCompleteProps) {
  const { t, lang } = useUIStore()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-white">{t.test.complete}</h2>
        </div>

        <div className="text-6xl font-extrabold text-brand-400">
          {score.total}
        </div>
        <p className="text-sm text-slate-400">{lang === 'ko' ? '/ 1600점 만점' : 'out of 1600'}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">{t.test.rwScore}</div>
            <div className="text-2xl font-bold text-white">{score.rw.scaled}</div>
            <div className="text-xs text-slate-500">
              {score.rw.correct}/{score.rw.total} {lang === 'ko' ? '정답' : 'correct'}
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">{t.test.mathScore}</div>
            <div className="text-2xl font-bold text-white">{score.math.scaled}</div>
            <div className="text-xs text-slate-500">
              {score.math.correct}/{score.math.total} {lang === 'ko' ? '정답' : 'correct'}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={onBackToDashboard}>
            {t.nav.dashboard}
          </Button>
          <Button onClick={onViewResults}>
            {t.test.viewResults}
          </Button>
        </div>
      </Card>
    </div>
  )
}
