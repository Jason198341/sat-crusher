import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import type { SATDomain } from '@/types/sat'
import { DOMAIN_LABELS } from '@/data/sat-domains'
import { Card } from '@/components/common/Card'
import { useUIStore } from '@/stores/uiStore'

interface DomainRadarProps {
  domainAccuracies: Map<SATDomain, { correct: number; total: number }>
}

export function DomainRadar({ domainAccuracies }: DomainRadarProps) {
  const { t, lang } = useUIStore()

  const data = Array.from(domainAccuracies.entries()).map(([domain, { correct, total }]) => ({
    domain: DOMAIN_LABELS[domain]?.[lang] ?? domain,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    fullMark: 100,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.domainBreakdown}</h3>
        <div className="h-48 flex items-center justify-center text-slate-500">
          {lang === 'ko'
            ? '연습을 더 하면 도메인별 분석이 나타납니다!'
            : 'Practice more to see domain breakdown!'}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.domainBreakdown}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar
            name={lang === 'ko' ? '정답률' : 'Accuracy'}
            dataKey="accuracy"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  )
}
