import { create } from 'zustand'
import type { ChatMessage, TutorModeType, ByeorakMeta } from '@/types/ai'
import { streamCompletion } from '@/lib/fireworks'
import { getSystemPromptForMode } from '@/data/prompts/byeorak-system'
import type { TutorMode } from '@/data/prompts/byeorak-system'

interface ChatState {
  messages: ChatMessage[]
  mode: TutorModeType
  isStreaming: boolean
  error: string | null
  abortController: AbortController | null
  /** Count of questions in current simulation session */
  sessionQuestionCount: number

  setMode: (mode: TutorModeType) => void
  sendMessage: (content: string, lang: 'en' | 'ko', dnaProfileSummary?: string) => Promise<void>
  addContext: (context: string) => void
  abort: () => void
  clearChat: () => void
}

/**
 * Try to parse 벼락 메타데이터 JSON from AI response.
 * The AI appends a ```json block at the end of explanations.
 */
export function parseByeorakMeta(content: string): ByeorakMeta | null {
  try {
    const jsonMatch = content.match(/```json\s*\n?([\s\S]*?)\n?\s*```/)
    if (!jsonMatch?.[1]) return null
    return JSON.parse(jsonMatch[1])
  } catch {
    return null
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  mode: 'free',
  isStreaming: false,
  error: null,
  abortController: null,
  sessionQuestionCount: 0,

  setMode: (mode) => {
    // Clear chat when switching modes
    get().abortController?.abort()
    set({
      mode,
      messages: [],
      isStreaming: false,
      error: null,
      abortController: null,
      sessionQuestionCount: 0,
    })
  },

  sendMessage: async (content, _lang, dnaProfileSummary) => {
    const { messages, mode } = get()

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    const controller = new AbortController()
    set({
      messages: [...messages, userMsg, assistantMsg],
      isStreaming: true,
      error: null,
      abortController: controller,
      sessionQuestionCount: get().sessionQuestionCount + 1,
    })

    try {
      const systemPrompt = getSystemPromptForMode(mode as TutorMode, dnaProfileSummary)

      // Build conversation history (skip system messages from display)
      const historyMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...historyMessages,
        { role: 'user' as const, content },
      ]

      let accumulated = ''
      await streamCompletion({
        messages: apiMessages,
        onChunk: (chunk) => {
          accumulated += chunk
          set((state) => {
            const msgs = [...state.messages]
            const last = msgs[msgs.length - 1]
            if (last?.role === 'assistant') {
              msgs[msgs.length - 1] = { ...last, content: accumulated }
            }
            return { messages: msgs }
          })
        },
        signal: controller.signal,
        maxTokens: 4096,
        temperature: 0.7,
      })

      set({ isStreaming: false })
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        set({ isStreaming: false })
        return
      }
      set({ error: (err as Error).message, isStreaming: false })
    }
  },

  addContext: (context) => {
    const systemMsg: ChatMessage = {
      id: `ctx-${Date.now()}`,
      role: 'system',
      content: context,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({ messages: [...state.messages, systemMsg] }))
  },

  abort: () => {
    get().abortController?.abort()
    set({ isStreaming: false })
  },

  clearChat: () => {
    get().abortController?.abort()
    set({
      messages: [],
      isStreaming: false,
      error: null,
      abortController: null,
      sessionQuestionCount: 0,
    })
  },
}))
