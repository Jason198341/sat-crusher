import { useState, useRef, useEffect } from 'react'
import { useChatStore, parseByeorakMeta } from '@/stores/chatStore'
import { useDNAStore } from '@/stores/dnaStore'
import { useUIStore } from '@/stores/uiStore'
import { TUTOR_MODE_LABELS } from '@/data/prompts/byeorak-system'
import type { TutorMode } from '@/data/prompts/byeorak-system'
import type { TutorModeType } from '@/types/ai'
import { MathRenderer } from '@/components/common/MathRenderer'
import { Button } from '@/components/common/Button'
import { TutorModeSelector } from './TutorModeSelector'
import { DNAProfilePanel } from './DNAProfilePanel'

const MODE_PLACEHOLDERS: Record<TutorModeType, { en: string; ko: string }> = {
  free:               { en: 'Ask anything about SAT...', ko: 'SAT에 대해 무엇이든 질문하세요...' },
  byeorak:            { en: 'Paste an SAT Reading question for 벼락 analysis...', ko: 'SAT Reading 문제를 붙여넣으세요 (벼락 해설)...' },
  'dna-guide':        { en: 'Ask about a trap type (1-10) or say "show all"...', ko: '오답 DNA 번호(1-10)를 말하거나 "전체 보여줘"...' },
  'passage-strategy': { en: 'Ask about a passage type or say "show all strategies"...', ko: '지문 유형을 물어보거나 "전략 알려줘"...' },
  'speed-run':        { en: 'Say "start" to begin timed practice...', ko: '"시작"이라고 말하면 스피드 런이 시작됩니다...' },
  'analysis-run':     { en: 'Say "start" to begin deep analysis practice...', ko: '"시작"이라고 말하면 분석 런이 시작됩니다...' },
  'weakness-run':     { en: 'Say "start" to target your weakest DNA types...', ko: '"시작"이라고 말하면 약점 런이 시작됩니다...' },
  vocabulary:         { en: 'Paste a vocabulary-in-context question or ask about CLUE method...', ko: '어휘 문맥 문제를 붙여넣거나 CLUE 메소드를 물어보세요...' },
}

export function TutorChat() {
  const { messages, mode, isStreaming, error, sendMessage, abort, clearChat, setMode } = useChatStore()
  const { buildProfileSummary, ingestByeorakMeta } = useDNAStore()
  const { t, lang } = useUIStore()
  const [input, setInput] = useState('')
  const [showModes, setShowModes] = useState(true)
  const [showDNA, setShowDNA] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Parse 벼락 metadata from completed assistant messages for DNA tracking
  useEffect(() => {
    if (messages.length <= prevMessageCountRef.current || isStreaming) {
      prevMessageCountRef.current = messages.length
      return
    }
    prevMessageCountRef.current = messages.length

    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'assistant' && lastMsg.content) {
      const meta = parseByeorakMeta(lastMsg.content)
      if (meta) {
        // For now, track as encountered (actual correct/incorrect handled in practice mode)
        ingestByeorakMeta(meta, true)
      }
    }
  }, [messages, isStreaming, ingestByeorakMeta])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    setShowModes(false)
    const dnaProfile = buildProfileSummary()
    sendMessage(trimmed, lang, dnaProfile)
  }

  const handleModeSelect = (newMode: TutorModeType) => {
    setMode(newMode)
    setShowModes(false)
  }

  const visibleMessages = messages.filter((m) => m.role !== 'system')
  const currentModeInfo = TUTOR_MODE_LABELS[mode as TutorMode]

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mode bar */}
        <div className="border-b border-surface-border px-4 py-2 flex items-center justify-between bg-surface-light/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModes(!showModes)}
              aria-expanded={showModes}
              aria-label={lang === 'ko' ? '튜터 모드 선택' : 'Select tutor mode'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-lighter hover:bg-surface-border text-sm transition-colors"
            >
              <span>{currentModeInfo?.icon}</span>
              <span className="font-medium text-slate-200">
                {lang === 'ko' ? currentModeInfo?.ko : currentModeInfo?.en}
              </span>
              <span className="text-slate-500 text-xs">{showModes ? '▲' : '▼'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDNA(!showDNA)}
              aria-label={lang === 'ko' ? (showDNA ? 'DNA 패널 닫기' : 'DNA 패널 열기') : (showDNA ? 'Close DNA panel' : 'Open DNA panel')}
              aria-pressed={showDNA}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                showDNA ? 'bg-brand-600/20 text-brand-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🧬 DNA
            </button>
            <button
              onClick={clearChat}
              aria-label={lang === 'ko' ? '대화 초기화' : 'Clear chat'}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              {lang === 'ko' ? '대화 초기화' : 'Clear'}
            </button>
          </div>
        </div>

        {/* Mode selector (collapsible) */}
        {showModes && (
          <div className="border-b border-surface-border bg-surface/80">
            <TutorModeSelector currentMode={mode} onSelect={handleModeSelect} />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite" aria-relevant="additions" aria-label={lang === 'ko' ? '튜터 채팅 메시지' : 'Tutor chat messages'}>
          {visibleMessages.length === 0 && (
            <div className="text-center text-slate-500 mt-12">
              <div className="text-5xl mb-4">{currentModeInfo?.icon || '⚡'}</div>
              <p className="text-xl font-bold text-slate-300 mb-2">
                {lang === 'ko' ? currentModeInfo?.ko : currentModeInfo?.en}
              </p>
              <p className="text-sm max-w-sm mx-auto">{currentModeInfo?.desc}</p>

              {/* Quick start hints per mode */}
              {mode === 'byeorak' && (
                <div className="mt-6 max-w-md mx-auto text-left bg-surface-light rounded-xl p-4 border border-surface-border">
                  <p className="text-xs text-brand-400 font-semibold mb-2">
                    {lang === 'ko' ? '💡 이렇게 사용하세요:' : '💡 How to use:'}
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li>1. SAT Reading 문제 전체를 복사해서 붙여넣기</li>
                    <li>2. 지문 + 질문 + 4개 선택지 포함</li>
                    <li>3. AI가 벼락 해설 프로토콜 (STEP 0-4)로 완전 분석</li>
                    <li>4. 3초 공식 + 변형 훈련 문제까지 제공</li>
                  </ul>
                </div>
              )}

              {mode === 'weakness-run' && (
                <div className="mt-6 max-w-md mx-auto">
                  <DNAProfilePanel />
                </div>
              )}
            </div>
          )}

          {visibleMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-light border border-surface-border'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="text-sm text-slate-200">
                    <MathRenderer
                      content={msg.content || (lang === 'ko' ? '⚡ 벼락 생성 중...' : '⚡ Generating lightning...')}
                      className="byeorak-content leading-relaxed"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div role="alert" className="text-center text-danger-400 text-sm">{error}</div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-surface-border p-4 bg-surface-light/30">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={lang === 'ko'
                ? MODE_PLACEHOLDERS[mode]?.ko
                : MODE_PLACEHOLDERS[mode]?.en}
              aria-label={lang === 'ko' ? '메시지 입력' : 'Message input'}
              rows={2}
              className="flex-1 bg-surface-lighter border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
            />
            {isStreaming ? (
              <Button variant="danger" onClick={abort} aria-label={lang === 'ko' ? '응답 중지' : 'Stop response'} className="self-end">
                {lang === 'ko' ? '중지' : 'Stop'}
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!input.trim()} aria-label={lang === 'ko' ? '메시지 보내기' : 'Send message'} className="self-end">
                {mode === 'byeorak' ? '⚡' : '→'}
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
            <span>{lang === 'ko' ? 'Shift+Enter로 줄바꿈' : 'Shift+Enter for new line'}</span>
            <span>
              {lang === 'ko' ? '벼락 깨달음 시스템 v1.0' : 'Lightning Revelation System v1.0'}
            </span>
          </div>
        </div>
      </div>

      {/* DNA sidebar (collapsible) */}
      {showDNA && (
        <div className="w-64 border-l border-surface-border bg-surface-light overflow-y-auto shrink-0 hidden lg:block">
          <DNAProfilePanel />
        </div>
      )}
    </div>
  )
}
