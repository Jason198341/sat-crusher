import type { TutorModeType } from '@/types/ai'
import { TUTOR_MODE_LABELS } from '@/data/prompts/byeorak-system'
import type { TutorMode } from '@/data/prompts/byeorak-system'
import { useUIStore } from '@/stores/uiStore'

interface TutorModeSelectorProps {
  currentMode: TutorModeType
  onSelect: (mode: TutorModeType) => void
}

const MODE_ORDER: TutorMode[] = [
  'free', 'byeorak', 'dna-guide', 'passage-strategy',
  'speed-run', 'analysis-run', 'weakness-run', 'vocabulary',
]

export function TutorModeSelector({ currentMode, onSelect }: TutorModeSelectorProps) {
  const { lang } = useUIStore()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
      {MODE_ORDER.map((mode) => {
        const info = TUTOR_MODE_LABELS[mode]
        const isActive = currentMode === mode

        return (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            aria-pressed={isActive}
            aria-label={lang === 'ko' ? info.ko : info.en}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all ${
              isActive
                ? 'bg-brand-600/20 border-2 border-brand-500 text-brand-300'
                : 'bg-surface-light border-2 border-transparent hover:border-surface-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xl" aria-hidden="true">{info.icon}</span>
            <span className="text-xs font-semibold leading-tight">
              {lang === 'ko' ? info.ko : info.en}
            </span>
          </button>
        )
      })}
    </div>
  )
}
