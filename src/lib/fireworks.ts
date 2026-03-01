import { checkDailyLimit, incrementDailyCount } from '@/lib/rate-limiter'
import { ApiError, NetworkError } from '@/lib/api-error'

const API_URL = '/api/fireworks/inference/v1/chat/completions'
const MODEL = 'accounts/fireworks/models/deepseek-v3p1'
const RATE_KEY = 'ai_call'
const RATE_LIMIT_MSG = '일일 AI 사용 한도(1회)를 초과했습니다. 내일 다시 시도해주세요.'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ─── Non-streaming completion ────────────────

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  const { allowed } = checkDailyLimit(RATE_KEY)
  if (!allowed) throw new Error(RATE_LIMIT_MSG)

  const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY
  if (!apiKey) throw new Error('VITE_FIREWORKS_API_KEY is not set')

  let res: Response
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
      }),
      signal: options?.signal,
    })
  } catch (err) {
    if (err instanceof TypeError) throw new NetworkError('네트워크 연결을 확인해주세요.')
    throw err
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `HTTP_${res.status}`, body || res.statusText)
  }

  const json = await res.json()
  incrementDailyCount(RATE_KEY)
  return json.choices?.[0]?.message?.content ?? ''
}

// ─── Streaming completion (SSE) ──────────────

interface StreamOptions {
  messages: ChatMessage[]
  onChunk: (text: string) => void
  signal?: AbortSignal
  maxTokens?: number
  temperature?: number
}

export async function streamCompletion({
  messages,
  onChunk,
  signal,
  maxTokens = 2048,
  temperature = 0.7,
}: StreamOptions): Promise<void> {
  const { allowed } = checkDailyLimit(RATE_KEY)
  if (!allowed) throw new Error(RATE_LIMIT_MSG)

  const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY
  if (!apiKey) throw new Error('VITE_FIREWORKS_API_KEY is not set')

  let res: Response
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        max_tokens: maxTokens,
        temperature,
      }),
      signal,
    })
  } catch (err) {
    if (err instanceof TypeError) throw new NetworkError('네트워크 연결을 확인해주세요.')
    throw err
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `HTTP_${res.status}`, body || res.statusText)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('Cannot read stream')

  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)
        if (payload === '[DONE]') {
          completed = true
          incrementDailyCount(RATE_KEY)
          return
        }

        try {
          const json = JSON.parse(payload)
          const content = json.choices?.[0]?.delta?.content
          if (content) onChunk(content)
        } catch {
          // skip malformed chunks
        }
      }
    }
    // Stream ended without [DONE] — still count as a completed call
    if (!completed) {
      incrementDailyCount(RATE_KEY)
    }
  } finally {
    reader.releaseLock()
  }
}
