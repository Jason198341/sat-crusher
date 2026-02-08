import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MathRenderer } from '@/components/common/MathRenderer'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import type { SATQuestion } from '@/types/sat'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { useDNAStore } from '@/stores/dnaStore'
import { WRONG_ANSWER_DNA_LIST } from '@/data/wrong-answer-dna'

interface QuestionCardProps {
  question: SATQuestion & { choiceDNA?: (string | null)[] }
  questionNumber: number
  totalQuestions: number
  selectedAnswer: number | null
  isSubmitted: boolean
  flagged: boolean
  onSelect: (index: number) => void
  onSubmit: () => void
  onNext: () => void
  onFinish?: () => void
  onPrev?: () => void
  onFlag: () => void
}

/** Map Korean DNA name to the DNA data object */
function findDNA(name: string | null) {
  if (!name) return null
  return WRONG_ANSWER_DNA_LIST.find(
    (d) => d.nameKo === name || d.name === name || d.nickname === name
  ) ?? null
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isSubmitted,
  flagged,
  onSelect,
  onSubmit,
  onNext,
  onFinish,
  onPrev,
  onFlag,
}: QuestionCardProps) {
  const { t, lang } = useUIStore()
  const navigate = useNavigate()
  const { setMode, addContext } = useChatStore()
  const { recordEncounter } = useDNAStore()
  const [showExplanation, setShowExplanation] = useState(false)
  const [dnaRecorded, setDnaRecorded] = useState(false)

  const explanation = lang === 'ko' ? question.explanationKo : question.explanation
  const isWrong = isSubmitted && selectedAnswer !== null && selectedAnswer !== question.correctAnswer

  // Record DNA when wrong answer is submitted (once per question)
  if (isWrong && !dnaRecorded && question.choiceDNA) {
    const selectedDNA = question.choiceDNA[selectedAnswer]
    if (selectedDNA) {
      const dna = findDNA(selectedDNA)
      if (dna) {
        recordEncounter([dna.id], true)
        setDnaRecorded(true)
      }
    }
  }

  // Send question to tutor for 벼락 analysis
  const handleAskTutor = () => {
    const questionText = [
      question.passage ? `Passage:\n${question.passage}\n` : '',
      `Question:\n${question.stimulus}\n`,
      ...question.choices.map((c) => `(${c.label}) ${c.text}`),
      `\nCorrect answer: (${question.choices[question.correctAnswer]?.label})`,
      selectedAnswer !== null ? `\nStudent chose: (${question.choices[selectedAnswer]?.label})` : '',
    ].join('\n')

    setMode('byeorak')
    addContext(`Student is asking about this question they got wrong:\n\n${questionText}`)
    navigate('/tutor')
  }

  return (
    <div className="space-y-4">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {onFinish
            ? `${lang === 'ko' ? '문제' : 'Q'} #${questionNumber}`
            : t.practice.questionOf
                .replace('{current}', String(questionNumber))
                .replace('{total}', String(totalQuestions))}
        </span>
        <button
          onClick={onFlag}
          className={`text-sm px-3 py-1 rounded-lg transition-colors ${
            flagged ? 'bg-warning-500/20 text-warning-400' : 'bg-surface-lighter text-slate-400 hover:text-white'
          }`}
        >
          {flagged ? '★' : '☆'} {t.test.flag}
        </button>
      </div>

      {/* Passage */}
      {question.passage && (
        <Card className="bg-surface/50 border-slate-700">
          <MathRenderer content={question.passage} className="text-slate-300 text-sm leading-relaxed" />
        </Card>
      )}

      {/* Question */}
      <Card>
        <MathRenderer content={question.stimulus} className="text-white text-base leading-relaxed mb-6" />

        {/* Choices */}
        <div className="space-y-3">
          {question.choices.map((choice, i) => {
            const isSelected = selectedAnswer === i
            const isCorrect = question.correctAnswer === i
            const dnaName = question.choiceDNA?.[i]
            const dna = isSubmitted && !isCorrect ? findDNA(dnaName ?? null) : null

            let choiceClass = 'border-surface-border hover:border-brand-500/50 hover:bg-brand-600/5'
            if (isSubmitted) {
              if (isCorrect) choiceClass = 'border-success-500 bg-success-500/10'
              else if (isSelected && !isCorrect) choiceClass = 'border-danger-500 bg-danger-500/10'
              else choiceClass = 'border-surface-border opacity-60'
            } else if (isSelected) {
              choiceClass = 'border-brand-500 bg-brand-600/10'
            }

            return (
              <button
                key={i}
                onClick={() => !isSubmitted && onSelect(i)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${choiceClass}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isSelected && !isSubmitted ? 'bg-brand-600 text-white' :
                    isSubmitted && isCorrect ? 'bg-success-500 text-white' :
                    isSubmitted && isSelected ? 'bg-danger-500 text-white' :
                    'bg-surface-lighter text-slate-400'
                  }`}>
                    {choice.label}
                  </span>
                  <div className="flex-1">
                    <MathRenderer content={choice.text} className="text-slate-200" />
                    {/* Show 오답 DNA tag for wrong choices after submission */}
                    {dna && isSubmitted && !isCorrect && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] bg-danger-500/10 text-danger-400 border border-danger-500/20">
                        {dna.icon} ☠️ {lang === 'ko' ? dna.nameKo : dna.name}
                      </span>
                    )}
                    {/* Show "생존" tag for correct answer */}
                    {isSubmitted && isCorrect && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-[10px] bg-success-500/10 text-success-400 border border-success-500/20">
                        ✅ {lang === 'ko' ? '생존 (정답)' : 'Survived (Correct)'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {onPrev && (
            <Button variant="ghost" onClick={onPrev}>{t.test.previous}</Button>
          )}
        </div>
        <div className="flex gap-2">
          {!isSubmitted ? (
            <Button onClick={onSubmit} disabled={selectedAnswer === null}>
              {t.practice.submit}
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {t.practice.showExplanation}
              </Button>
              {/* Ask Tutor button — sends to 벼락 해설 mode */}
              {isWrong && (
                <Button
                  variant="ghost"
                  className="border border-brand-500/30 text-brand-400"
                  onClick={handleAskTutor}
                >
                  ⚡ {lang === 'ko' ? '벼락 해설' : 'Lightning Explain'}
                </Button>
              )}
              {onFinish && (
                <Button variant="secondary" onClick={onFinish}>
                  {lang === 'ko' ? '연습 종료' : 'Finish'}
                </Button>
              )}
              <Button onClick={onNext}>
                {onFinish
                  ? (lang === 'ko' ? '다음 문제' : 'Next Question')
                  : t.practice.next}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && isSubmitted && (
        <Card className="bg-brand-600/5 border-brand-600/30">
          <h4 className="text-sm font-semibold text-brand-400 mb-2">{t.practice.showExplanation}</h4>
          <MathRenderer content={explanation} className="text-slate-300 text-sm leading-relaxed" />

          {/* Show DNA kill switch for the wrong answer the student chose */}
          {isWrong && selectedAnswer !== null && question.choiceDNA && (
            () => {
              const chosenDNA = findDNA(question.choiceDNA?.[selectedAnswer] ?? null)
              if (!chosenDNA) return null
              return (
                <div className="mt-4 p-3 bg-danger-500/5 rounded-lg border border-danger-500/20">
                  <div className="text-xs font-semibold text-danger-400 mb-1">
                    {chosenDNA.icon} {lang === 'ko' ? `오답 DNA: ${chosenDNA.nameKo}` : `Trap DNA: ${chosenDNA.name}`}
                    <span className="text-slate-500 ml-1">"{chosenDNA.nickname}"</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {lang === 'ko' ? `킬 스위치: ${chosenDNA.killSwitchKo}` : `Kill switch: ${chosenDNA.killSwitch}`}
                  </div>
                </div>
              )
            }
          )()}
        </Card>
      )}
    </div>
  )
}
