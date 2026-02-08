import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TestScore } from '@/types/sat'
import { Card } from '@/components/common/Card'
import { useUIStore } from '@/stores/uiStore'

interface ScoreChartProps {
  scores: TestScore[]
}

export function ScoreChart({ scores }: ScoreChartProps) {
  const { t, lang } = useUIStore()

  const data = scores.map((s, i) => ({
    name: lang === 'ko' ? `${i + 1}회차` : `Test ${i + 1}`,
    total: s.total,
    rw: s.rw.scaled,
    math: s.math.scaled,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.scoreHistory}</h3>
        <div className="h-48 flex items-center justify-center text-slate-500">
          {lang === 'ko'
            ? '아직 모의고사 점수가 없습니다. 모의고사를 응시하면 추이가 표시됩니다!'
            : 'No test scores yet. Take a mock test to see your progress!'}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">{t.dashboard.scoreHistory}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis domain={[400, 1600]} stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} name={lang === 'ko' ? '총점' : 'Total'} dot={{ fill: '#6366f1' }} />
          <Line type="monotone" dataKey="rw" stroke="#22c55e" strokeWidth={1.5} name={lang === 'ko' ? '읽기&쓰기' : 'R&W'} dot={{ fill: '#22c55e' }} />
          <Line type="monotone" dataKey="math" stroke="#f59e0b" strokeWidth={1.5} name={lang === 'ko' ? '수학' : 'Math'} dot={{ fill: '#f59e0b' }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
