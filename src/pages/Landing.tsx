import { Link } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/common/Button'

export function Landing() {
  const { t, lang } = useUIStore()

  const features = [
    { icon: '⚡', title: t.landing.f1Title, desc: t.landing.f1Desc },
    { icon: '🎯', title: t.landing.f2Title, desc: t.landing.f2Desc },
    { icon: '🧬', title: t.landing.f3Title, desc: t.landing.f3Desc },
    { icon: '🤖', title: t.landing.f4Title, desc: t.landing.f4Desc },
  ]

  const stats = [
    { label: lang === 'ko' ? '목표 점수' : 'Target', score: '1500+', color: 'text-brand-400' },
    { label: lang === 'ko' ? '무한 문제' : 'Questions', score: '∞', color: 'text-success-400' },
    { label: lang === 'ko' ? '이중언어' : 'Languages', score: 'EN/KR', color: 'text-warning-400' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-block bg-brand-600/20 text-brand-400 text-sm font-medium px-3 py-1 rounded-full mb-6">
          {t.app.tagline}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          {t.landing.hero}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.landing.sub}
        </p>
        <Link to="/signup">
          <Button size="lg" className="text-base px-8">
            {t.landing.cta}
          </Button>
        </Link>

        <div className="mt-16 flex justify-center gap-6">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-3xl font-bold ${item.color}`}>{item.score}</div>
              <div className="text-sm text-slate-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">{t.landing.features}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface-light border border-surface-border rounded-xl p-6 hover:border-brand-600/30 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Use Guide */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {lang === 'ko' ? '이용 가이드' : 'How to Use'}
        </h2>
        <div className="space-y-4">
          {[
            { step: '01', icon: '📝', text: lang === 'ko' ? '회원가입 후 대시보드에서 목표 점수와 시험일을 설정하세요' : 'Sign up and set your target score and test date on the dashboard' },
            { step: '02', icon: '⚡', text: lang === 'ko' ? '연습 모드에서 섹션/도메인/토픽을 선택하면 AI가 맞춤 문제를 생성합니다' : 'Select section/domain/topic in Practice Mode and AI generates custom questions' },
            { step: '03', icon: '🧬', text: lang === 'ko' ? '오답은 자동으로 오답 DNA가 분류됩니다. ⚡벼락 해설로 깊이 이해하세요' : 'Wrong answers are auto-classified by DNA type. Use Lightning Explain for deep understanding' },
            { step: '04', icon: '🎯', text: lang === 'ko' ? '모의고사로 실전 감각을 키우고, 복습 큐(SM-2)로 약점을 완전 정복하세요' : 'Build test skills with Mock Tests and conquer weaknesses with SM-2 Review Queue' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start bg-surface-light border border-surface-border rounded-xl p-5">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center text-lg font-bold">
                {item.icon}
              </div>
              <div>
                <span className="text-xs text-brand-400 font-semibold">STEP {item.step}</span>
                <p className="text-sm text-slate-300 mt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 text-center text-sm text-slate-500">
        {lang === 'ko'
          ? 'SAT Crusher — AI와 함께 SAT를 정복하는 학생들을 위해 만들어졌습니다.'
          : 'SAT Crusher — Built with AI for students who crush it.'}
      </footer>
    </div>
  )
}
