import type { SATDomain } from '@/types/sat'
import { DOMAIN_LABELS } from '@/data/sat-domains'
import { Card } from '@/components/common/Card'
import { useUIStore } from '@/stores/uiStore'

interface WeaknessTableProps {
  weaknesses: { domain: SATDomain; accuracy: number }[]
}

export function WeaknessTable({ weaknesses }: WeaknessTableProps) {
  const { t, lang } = useUIStore()

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.weaknesses}</h3>
      {weaknesses.length === 0 ? (
        <p className="text-slate-500 text-sm">
          {lang === 'ko' ? '연습을 더 하면 약점 분석이 나타납니다!' : 'Practice more to identify weaknesses!'}
        </p>
      ) : (
        <div className="space-y-3">
          {weaknesses.map(({ domain, accuracy }) => (
            <div key={domain} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {DOMAIN_LABELS[domain]?.[lang] ?? domain}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 rounded-full bg-surface-lighter overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      accuracy < 0.5 ? 'bg-danger-500' : accuracy < 0.7 ? 'bg-warning-500' : 'bg-success-500'
                    }`}
                    style={{ width: `${accuracy * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-12 text-right ${
                  accuracy < 0.5 ? 'text-danger-400' : accuracy < 0.7 ? 'text-warning-400' : 'text-success-400'
                }`}>
                  {Math.round(accuracy * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
