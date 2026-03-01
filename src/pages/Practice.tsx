import { useState, useRef, useCallback } from 'react'
import DOMPurify from 'dompurify'
import { usePracticeStore } from '@/stores/practiceStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useUIStore } from '@/stores/uiStore'
import { SAT_TOPICS, DOMAIN_LABELS, SECTION_LABELS } from '@/data/sat-domains'
import type { SATSection, SATDomain, Difficulty } from '@/types/sat'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { QuestionCard } from '@/components/question/QuestionCard'

type Phase = 'select' | 'generating' | 'questions' | 'results'

const DIFF_LABELS: Record<Difficulty, { ko: string; en: string }> = {
  easy: { ko: '쉬움', en: 'Easy' },
  medium: { ko: '보통', en: 'Medium' },
  hard: { ko: '어려움', en: 'Hard' },
}

export function Practice() {
  const { t, lang } = useUIStore()
  const store = usePracticeStore()
  const dashboard = useDashboardStore()
  const [phase, setPhase] = useState<Phase>('select')
  const questionTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sections: SATSection[] = ['rw', 'math']
  const domains = store.section
    ? [...new Set(SAT_TOPICS.filter((t) => t.section === store.section).map((t) => t.domain))]
    : []
  const topics = store.domain
    ? SAT_TOPICS.filter((t) => t.section === store.section && t.domain === store.domain)
    : []

  const startTimer = useCallback(() => {
    questionTimeRef.current = 0
    timerRef.current = setInterval(() => { questionTimeRef.current++ }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    return questionTimeRef.current
  }, [])

  const handleGenerate = async () => {
    setPhase('generating')
    startTimer()
    await store.generateQuestions(lang)
    if (store.questions.length > 0) {
      setPhase('questions')
    } else {
      setPhase('select')
    }
  }

  const handleSubmit = () => {
    const time = stopTimer()
    const current = store.answers[store.currentIndex]
    if (current?.selectedAnswer !== null && current?.selectedAnswer !== undefined) {
      store.submitAnswer(current.selectedAnswer, time)
    }
  }

  const handleNext = async () => {
    setPhase('generating')
    await store.generateNextQuestion(lang)
    if (store.questions.length > 0) {
      startTimer()
      setPhase('questions')
    } else {
      setPhase('select')
    }
  }

  const handleFinish = () => {
    const results = store.answers.map((a) => ({
      domain: a.question.domain,
      isCorrect: a.isCorrect,
    }))
    dashboard.recordPracticeResults(results)
    setPhase('results')
  }

  const handleReset = () => {
    store.reset()
    setPhase('select')
  }

  // Results
  if (phase === 'results') {
    const correct = store.answers.filter((a) => a.isCorrect).length
    const total = store.answers.length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">{t.practice.results}</h2>
          <div className="text-5xl font-extrabold text-brand-400">{accuracy}%</div>
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-2xl font-bold text-success-400">{correct}</div>
              <div className="text-sm text-slate-400">{t.practice.correct}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-danger-400">{total - correct}</div>
              <div className="text-sm text-slate-400">{t.practice.incorrect}</div>
            </div>
          </div>

          {store.answers.filter((a) => !a.isCorrect).map((a, i) => (
            <div key={i} className="bg-danger-500/5 border border-danger-500/20 rounded-lg p-3 text-left">
              <p className="text-sm text-slate-300 line-clamp-2">{a.question.stimulus}</p>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ko' ? '정답' : 'Correct'}: {a.question.choices[a.question.correctAnswer]?.label}
              </p>
            </div>
          ))}

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={handleReset}>{t.practice.backToTopics}</Button>
            <Button onClick={() => { setPhase('generating'); handleGenerate() }}>{t.practice.tryAgain}</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Question view
  if (phase === 'questions' && store.questions.length > 0) {
    const currentQ = store.questions[store.currentIndex]!
    const currentA = store.answers[store.currentIndex]!

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <QuestionCard
          question={currentQ}
          questionNumber={store.currentIndex + 1}
          totalQuestions={store.questions.length}
          selectedAnswer={currentA.selectedAnswer}
          isSubmitted={currentA.selectedAnswer !== null && currentA.isCorrect !== undefined && currentA.timeSpentSeconds > 0}
          flagged={currentA.flagged}
          onSelect={(i) => {
            const updated = [...store.answers]
            updated[store.currentIndex] = { ...updated[store.currentIndex]!, selectedAnswer: i }
            usePracticeStore.setState({ answers: updated })
          }}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onFinish={handleFinish}
          onFlag={() => store.flagQuestion()}
        />
      </div>
    )
  }

  // Generating
  if (phase === 'generating') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-slate-300">{t.practice.generating}</p>
          <p className="text-sm text-slate-500">
            {lang === 'ko'
              ? 'Fireworks AI가 선택하신 토픽과 난이도에 맞는 SAT 스타일 문제를 만들고 있습니다'
              : 'AI is creating SAT-style questions matching your selected topic and difficulty'}
          </p>
        </div>
      </div>
    )
  }

  // Topic Selection
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-4">{t.practice.title}</h1>

      {/* Usage Guide */}
      <div className="guide-card mb-8">
        <div className="guide-title">
          📖 {lang === 'ko' ? '연습 모드 사용법' : 'Practice Mode Guide'}
        </div>
        <div className="space-y-1">
          {(lang === 'ko' ? [
            '**1단계**: 아래에서 섹션을 선택하세요 (읽기&쓰기 또는 수학)',
            '**2단계**: 도메인을 선택하세요 (예: Craft and Structure)',
            '**3단계**: 세부 토픽을 선택하세요',
            '**4단계**: 난이도를 선택하세요 — 쉬움/보통/어려움',
            '**5단계**: \'문제 생성하기\' 버튼을 누르면 AI가 **한 문제씩** 생성합니다',
            '문제를 풀고 나면 **다음 문제** 또는 **연습 종료**를 선택할 수 있습니다',
            '틀린 문제에는 ⚡**벼락 해설** 버튼이 나타납니다 → 누르면 AI 튜터가 상세 해설을 제공합니다',
          ] : [
            '**Step 1**: Select a section below (Reading & Writing or Math)',
            '**Step 2**: Choose a domain',
            '**Step 3**: Pick a specific topic',
            '**Step 4**: Set difficulty — Easy/Medium/Hard',
            '**Step 5**: Hit "Generate Questions" and AI creates **one question at a time**',
            'After answering, choose **Next Question** or **Finish Practice**',
            'Wrong answers show a ⚡**Lightning Explain** button for detailed AI tutoring',
          ]).map((text, i) => (
            <p key={i} className="guide-step" dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
            }} />
          ))}
        </div>
      </div>

      {/* Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">{t.practice.selectSection}</h3>
        <div className="flex gap-3">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => store.setConfig({ section: s, domain: undefined as unknown as SATDomain, topicId: undefined as unknown as string })}
              className={`px-5 py-3 rounded-xl font-medium transition-colors ${
                store.section === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-light border border-surface-border text-slate-300 hover:border-brand-500/50'
              }`}
            >
              {SECTION_LABELS[s]?.[lang] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Domain */}
      {store.section && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">{t.practice.selectDomain}</h3>
          <div className="grid grid-cols-2 gap-3">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => store.setConfig({ domain: d, topicId: undefined as unknown as string })}
                className={`px-4 py-3 rounded-xl text-left font-medium text-sm transition-colors ${
                  store.domain === d
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-light border border-surface-border text-slate-300 hover:border-brand-500/50'
                }`}
              >
                {DOMAIN_LABELS[d]?.[lang] ?? d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topic */}
      {store.domain && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">{t.practice.selectTopic}</h3>
          <div className="space-y-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => store.setConfig({ topicId: topic.id })}
                className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                  store.topicId === topic.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-light border border-surface-border text-slate-300 hover:border-brand-500/50'
                }`}
              >
                <div className="font-medium text-sm">{lang === 'ko' ? topic.nameKo : topic.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{topic.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty */}
      {store.topicId && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">{t.practice.difficulty}</h3>
          <div className="flex gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => store.setConfig({ difficulty: d })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  store.difficulty === d
                    ? d === 'easy' ? 'bg-success-500 text-white' : d === 'hard' ? 'bg-danger-500 text-white' : 'bg-warning-500 text-white'
                    : 'bg-surface-light border border-surface-border text-slate-400'
                }`}
              >
                {DIFF_LABELS[d][lang]}
              </button>
            ))}
          </div>
        </div>
      )}

      {store.topicId && (
        <Button size="lg" onClick={handleGenerate} className="mt-4">
          {t.practice.start}
        </Button>
      )}

      {store.error && (
        <div role="alert" className="mt-4 bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm rounded-lg px-3 py-2">
          {store.error}
        </div>
      )}
    </div>
  )
}
