import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useUIStore } from '@/stores/uiStore'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { ScoreChart } from '@/components/dashboard/ScoreChart'
import { DomainRadar } from '@/components/dashboard/DomainRadar'
import { WeaknessTable } from '@/components/dashboard/WeaknessTable'

export function Dashboard() {
  const { t, lang } = useUIStore()
  const { profile } = useAuthStore()
  const { scores, domainAccuracies, reviewsDue, getPredictedScore, getWeakDomains } = useDashboardStore()

  const predictedScore = getPredictedScore()
  const weakDomains = getWeakDomains()

  let totalCorrect = 0, totalAttempted = 0
  for (const [, { correct, total }] of domainAccuracies) {
    totalCorrect += correct
    totalAttempted += total
  }
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {t.dashboard.welcome}, {profile?.displayName || (lang === 'ko' ? '학생' : 'Student')}!
        </h1>
        <p className="text-slate-400 mt-1">{t.dashboard.title}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-sm text-slate-400">{t.dashboard.totalScore}</div>
          <div className="text-3xl font-bold text-brand-400 mt-1">{predictedScore}</div>
          <div className="text-xs text-slate-500 mt-1">/ 1600</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-400">{t.dashboard.streak}</div>
          <div className="text-3xl font-bold text-warning-400 mt-1">{profile?.streak ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1">{lang === 'ko' ? '일째' : 'days'}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-400">{t.dashboard.questionsToday}</div>
          <div className="text-3xl font-bold text-success-400 mt-1">{totalAttempted}</div>
          <div className="text-xs text-slate-500 mt-1">{lang === 'ko' ? '문제' : 'questions'}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-400">{t.dashboard.accuracy}</div>
          <div className="text-3xl font-bold text-white mt-1">{accuracy}%</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link to="/practice">
          <Button size="lg">{t.dashboard.startPractice}</Button>
        </Link>
        <Link to="/mock-test">
          <Button variant="secondary" size="lg">{t.dashboard.startMock}</Button>
        </Link>
        {reviewsDue > 0 && (
          <Link to="/review">
            <Button variant="ghost" size="lg">
              {t.dashboard.reviewDue}: {reviewsDue}
            </Button>
          </Link>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ScoreChart scores={scores} />
        <DomainRadar domainAccuracies={domainAccuracies} />
      </div>

      <WeaknessTable weaknesses={weakDomains} />

      {/* Usage Guide */}
      <div className="mt-8 guide-card">
        <div className="guide-title">
          📖 {lang === 'ko' ? '대시보드 사용법' : 'Dashboard Guide'}
        </div>
        <div className="space-y-1">
          {(lang === 'ko' ? [
            '**예측 점수**는 모의고사 결과 기반으로 자동 계산됩니다',
            '**연속 학습일**은 매일 1문제 이상 풀면 자동으로 올라갑니다',
            '**도메인별 분석** 레이더 차트로 어떤 영역이 부족한지 한눈에 파악하세요',
            '**약점 토픽**은 정답률이 낮은 순으로 정렬됩니다 — 여기부터 연습하세요!',
            '연습/모의고사를 많이 할수록 분석이 더 정확해집니다',
          ] : [
            '**Predicted Score** is auto-calculated based on mock test results',
            '**Day Streak** increases when you solve at least 1 question daily',
            '**Domain Breakdown** radar chart shows your strengths and weaknesses at a glance',
            '**Top Weaknesses** are sorted by lowest accuracy — focus your practice here!',
            'The more you practice, the more accurate your analytics become',
          ]).map((text, i) => (
            <p key={i} className="guide-step" dangerouslySetInnerHTML={{
              __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
