import { useTestStore } from '@/stores/testStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useUIStore } from '@/stores/uiStore'
import { useTimer } from '@/hooks/useTimer'
import { MODULE_CONFIGS } from '@/types/sat'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { QuestionCard } from '@/components/question/QuestionCard'
import { TestHeader } from '@/components/test/TestHeader'
import { TestComplete } from '@/components/test/TestComplete'
import { ModuleTransition } from '@/components/test/ModuleTransition'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function MockTest() {
  const { t, lang } = useUIStore()
  const store = useTestStore()
  const dashboard = useDashboardStore()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const moduleConfig = store.currentModule ? MODULE_CONFIGS[store.currentModule] : null
  const timer = useTimer({
    initialSeconds: (moduleConfig?.timeLimitMinutes ?? 32) * 60,
    countDown: true,
    autoStart: store.phase === 'in_progress',
    onExpire: () => store.submitModule(),
  })

  // Idle — start screen
  if (store.phase === 'idle') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center space-y-6">
          <div className="text-4xl">📝</div>
          <h1 className="text-3xl font-bold text-white">{t.test.fullTest}</h1>
          <p className="text-slate-400">{t.test.description}</p>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-surface/50 rounded-lg p-4">
              <div className="text-sm font-medium text-white">
                {lang === 'ko' ? '읽기 & 쓰기 섹션' : 'R&W Section'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Module 1: 27{lang === 'ko' ? '문제' : 'Q'} / 32{lang === 'ko' ? '분' : 'min'}
              </div>
              <div className="text-xs text-slate-400">
                Module 2: 27{lang === 'ko' ? '문제' : 'Q'} / 32{lang === 'ko' ? '분 (적응형)' : 'min (adaptive)'}
              </div>
            </div>
            <div className="bg-surface/50 rounded-lg p-4">
              <div className="text-sm font-medium text-white">
                {lang === 'ko' ? '수학 섹션' : 'Math Section'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Module 1: 22{lang === 'ko' ? '문제' : 'Q'} / 35{lang === 'ko' ? '분' : 'min'}
              </div>
              <div className="text-xs text-slate-400">
                Module 2: 22{lang === 'ko' ? '문제' : 'Q'} / 35{lang === 'ko' ? '분 (적응형)' : 'min (adaptive)'}
              </div>
            </div>
          </div>

          {/* Usage Guide */}
          <div className="guide-card text-left">
            <div className="guide-title">
              📖 {lang === 'ko' ? '모의고사 사용법' : 'Mock Test Guide'}
            </div>
            <div className="space-y-1">
              {(lang === 'ko' ? [
                '실제 **Digital SAT**와 동일한 적응형 모듈 시스템입니다',
                'Module 1 정답률 **60% 이상** → Hard Module 2 (높은 점수 가능)',
                'Module 1 정답률 **60% 미만** → Easy Module 2 (점수 상한 제한)',
                '⭐ **깃발 표시**로 나중에 검토할 문제를 마킹하세요',
                '⏱️ 시간이 다 되면 **자동으로 모듈이 제출**됩니다',
                '전체 소요시간: 약 **2시간 14분** (R&W 64분 + Math 70분)',
              ] : [
                'Uses the same adaptive module system as the real **Digital SAT**',
                'Module 1 accuracy **≥ 60%** → Hard Module 2 (higher score ceiling)',
                'Module 1 accuracy **< 60%** → Easy Module 2 (limited score range)',
                '⭐ Use **flag** to mark questions for later review',
                '⏱️ Module **auto-submits** when time runs out',
                'Total time: about **2h 14min** (R&W 64min + Math 70min)',
              ]).map((text, i) => (
                <p key={i} className="guide-step" dangerouslySetInnerHTML={{
                  __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              ))}
            </div>
          </div>

          {store.error && (
            <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm rounded-lg px-3 py-2">
              {store.error}
            </div>
          )}

          <Button size="lg" onClick={() => store.startMockTest(lang)}>
            {t.test.start}
          </Button>
        </Card>
      </div>
    )
  }

  // Generating
  if (store.phase === 'generating') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-slate-300">
            {lang === 'ko' ? 'AI가 시험 문제를 생성하고 있습니다...' : 'Generating questions...'}
          </p>
          <p className="text-sm text-slate-500">
            {lang === 'ko'
              ? '실제 시험과 동일한 난이도 분배로 문제를 만들고 있습니다'
              : 'This may take a moment as AI creates your custom test'}
          </p>
        </div>
      </div>
    )
  }

  // Module Transition
  if (store.phase === 'module_transition') {
    const lastResult = store.moduleResults[store.moduleResults.length - 1]
    return (
      <ModuleTransition
        completedModule={lastResult?.moduleType ?? ''}
        nextModule={lang === 'ko' ? '다음 모듈' : 'Next Module'}
      />
    )
  }

  // Completed
  if (store.phase === 'completed' && store.score) {
    dashboard.addScore(store.score)
    return (
      <TestComplete
        score={store.score}
        onViewResults={() => navigate('/dashboard')}
        onBackToDashboard={() => { store.reset(); navigate('/dashboard') }}
      />
    )
  }

  // In Progress
  if (store.phase === 'in_progress' && store.currentModule && store.currentModuleQuestions.length > 0) {
    const currentQ = store.currentModuleQuestions[store.currentIndex]!
    const currentA = store.answers[store.currentIndex]!

    const answeredCount = store.answers.filter((a) => a.selectedAnswer !== null).length
    const flaggedCount = store.answers.filter((a) => a.flagged).length

    return (
      <div>
        <TestHeader
          moduleType={store.currentModule}
          currentQuestion={store.currentIndex + 1}
          totalQuestions={store.currentModuleQuestions.length}
          timeFormatted={timer.formatted}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
        />

        <div className="max-w-3xl mx-auto px-4 py-6">
          <QuestionCard
            question={currentQ}
            questionNumber={store.currentIndex + 1}
            totalQuestions={store.currentModuleQuestions.length}
            selectedAnswer={currentA.selectedAnswer}
            isSubmitted={false}
            flagged={currentA.flagged}
            onSelect={(i) => store.submitAnswer(i, 0)}
            onSubmit={() => store.nextQuestion()}
            onNext={() => store.nextQuestion()}
            onPrev={store.currentIndex > 0 ? () => store.prevQuestion() : undefined}
            onFlag={() => store.flagQuestion()}
          />

          <div className="mt-8 flex justify-end">
            <Button variant="danger" onClick={() => setShowConfirm(true)}>
              {t.test.submit}
            </Button>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <Card className="max-w-sm text-center space-y-4">
                <p className="text-white">{t.test.confirmSubmit}</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary" onClick={() => setShowConfirm(false)}>{t.common.cancel}</Button>
                  <Button variant="danger" onClick={() => { setShowConfirm(false); timer.pause(); store.submitModule() }}>
                    {t.test.submit}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
