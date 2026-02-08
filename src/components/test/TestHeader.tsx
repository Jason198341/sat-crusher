import { useUIStore } from '@/stores/uiStore'
import type { ModuleType } from '@/types/sat'
import { MODULE_CONFIGS } from '@/types/sat'

interface TestHeaderProps {
  moduleType: ModuleType
  currentQuestion: number
  totalQuestions: number
  timeFormatted: string
  answeredCount: number
  flaggedCount: number
}

const MODULE_LABELS: Record<ModuleType, { en: string; ko: string }> = {
  'rw1':       { en: 'R&W Module 1', ko: '읽기&쓰기 모듈 1' },
  'rw2-easy':  { en: 'R&W Module 2', ko: '읽기&쓰기 모듈 2' },
  'rw2-hard':  { en: 'R&W Module 2', ko: '읽기&쓰기 모듈 2' },
  'math1':     { en: 'Math Module 1', ko: '수학 모듈 1' },
  'math2-easy':{ en: 'Math Module 2', ko: '수학 모듈 2' },
  'math2-hard':{ en: 'Math Module 2', ko: '수학 모듈 2' },
}

export function TestHeader({
  moduleType,
  currentQuestion,
  totalQuestions,
  timeFormatted,
  answeredCount,
  flaggedCount,
}: TestHeaderProps) {
  const { t, lang } = useUIStore()

  return (
    <div className="bg-surface-light border-b border-surface-border px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-brand-400">
            {lang === 'ko' ? MODULE_LABELS[moduleType].ko : MODULE_LABELS[moduleType].en}
          </span>
          <span className="text-sm text-slate-400">
            {t.test.question} {currentQuestion}/{totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            {answeredCount}/{totalQuestions} {lang === 'ko' ? '답변 완료' : 'answered'}
          </span>
          {flaggedCount > 0 && (
            <span className="text-sm text-warning-400">★ {flaggedCount} {lang === 'ko' ? '표시됨' : 'flagged'}</span>
          )}
          <span className={`font-mono text-sm font-semibold ${
            parseInt(timeFormatted) < 5 ? 'text-danger-400' : 'text-white'
          }`}>
            {t.test.timeRemaining}: {timeFormatted}
          </span>
        </div>
      </div>
    </div>
  )
}
