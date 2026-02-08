import { useDNAStore } from '@/stores/dnaStore'
import { WRONG_ANSWER_DNA_LIST } from '@/data/wrong-answer-dna'
import { useUIStore } from '@/stores/uiStore'

export function DNAProfilePanel() {
  const { lang } = useUIStore()
  const { profile, getWeakestDNA } = useDNAStore()
  const weakest = getWeakestDNA()

  if (profile.totalAnalyzed === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-3xl mb-2">🧬</div>
        <p className="text-sm text-slate-400">
          {lang === 'ko'
            ? '아직 오답 DNA 데이터가 없어요. 벼락 해설 모드에서 문제를 풀어보세요!'
            : 'No DNA data yet. Try solving questions in Lightning Explain mode!'}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          🧬 {lang === 'ko' ? '오답 DNA 프로필' : 'Wrong Answer DNA Profile'}
        </h3>
        <span className="text-xs text-slate-500">
          {profile.totalAnalyzed} {lang === 'ko' ? '문제 분석' : 'analyzed'}
        </span>
      </div>

      {/* Top weaknesses */}
      <div className="space-y-2">
        {weakest.slice(0, 5).map((w) => {
          const dna = WRONG_ANSWER_DNA_LIST.find((d) => d.id === w.id)
          const pct = Math.round(w.rate * 100)

          return (
            <div key={w.id} className="bg-surface rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300">
                  {dna?.icon} {lang === 'ko' ? w.nameKo : w.name}
                </span>
                <span className={`text-xs font-bold ${
                  pct >= 60 ? 'text-danger-400' : pct >= 30 ? 'text-warning-400' : 'text-success-400'
                }`}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-lighter overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 60 ? 'bg-danger-500' : pct >= 30 ? 'bg-warning-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {lang === 'ko' ? `${w.count}회 만남` : `${w.count} encounters`}
              </div>
            </div>
          )
        })}
      </div>

      {/* All DNA types compact view */}
      <div className="pt-2 border-t border-surface-border">
        <div className="text-[10px] text-slate-500 mb-2">
          {lang === 'ko' ? '전체 DNA 도감' : 'All DNA Types'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {WRONG_ANSWER_DNA_LIST.map((dna) => {
            const trap = profile.traps[dna.id]
            const hasData = trap && trap.encountered > 0
            const rate = hasData ? trap.fellFor / trap.encountered : 0

            return (
              <span
                key={dna.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                  !hasData ? 'bg-surface-lighter text-slate-500' :
                  rate >= 0.5 ? 'bg-danger-500/20 text-danger-400' :
                  rate >= 0.2 ? 'bg-warning-500/20 text-warning-400' :
                  'bg-success-500/20 text-success-400'
                }`}
                title={`${dna.nameKo}: ${hasData ? Math.round(rate * 100) + '%' : 'No data'}`}
              >
                {dna.icon} #{dna.number}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
