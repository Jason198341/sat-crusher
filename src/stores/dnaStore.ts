import { create } from 'zustand'
import type { DNAProfile, ByeorakMeta } from '@/types/ai'
import { WRONG_ANSWER_DNA_LIST } from '@/data/wrong-answer-dna'

const STORAGE_KEY = 'sc_dna_profile'

function loadProfile(): DNAProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }

  // Initialize with all DNA types at 0
  const traps: DNAProfile['traps'] = {}
  for (const dna of WRONG_ANSWER_DNA_LIST) {
    traps[dna.id] = { encountered: 0, fellFor: 0 }
  }
  return { traps, totalAnalyzed: 0, lastUpdated: new Date().toISOString() }
}

function saveProfile(profile: DNAProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

interface DNAState {
  profile: DNAProfile

  /** Record that the student encountered specific DNA traps in a question */
  recordEncounter: (dnaIds: string[], fellFor: boolean) => void

  /** Ingest metadata from a 벼락 해설 response */
  ingestByeorakMeta: (meta: ByeorakMeta, wasCorrect: boolean) => void

  /** Get sorted list of weakest DNA types (highest fellFor rate) */
  getWeakestDNA: () => Array<{ id: string; name: string; nameKo: string; rate: number; count: number }>

  /** Build a text summary for the AI prompt */
  buildProfileSummary: () => string

  /** Reset profile */
  resetProfile: () => void
}

export const useDNAStore = create<DNAState>((set, get) => ({
  profile: loadProfile(),

  recordEncounter: (dnaIds, fellFor) => {
    set((state) => {
      const traps = { ...state.profile.traps }
      for (const id of dnaIds) {
        const prev = traps[id] ?? { encountered: 0, fellFor: 0 }
        traps[id] = {
          encountered: prev.encountered + 1,
          fellFor: fellFor ? prev.fellFor + 1 : prev.fellFor,
        }
      }
      const profile: DNAProfile = {
        traps,
        totalAnalyzed: state.profile.totalAnalyzed + 1,
        lastUpdated: new Date().toISOString(),
      }
      saveProfile(profile)
      return { profile }
    })
  },

  ingestByeorakMeta: (meta, wasCorrect) => {
    if (meta.wrongAnswerDNA?.length) {
      // Map Korean DNA names to IDs
      const dnaIds = meta.wrongAnswerDNA.map((name) => {
        const match = WRONG_ANSWER_DNA_LIST.find(
          (d) => d.nameKo === name || d.name === name || d.nickname === name
        )
        return match?.id ?? name
      }).filter(Boolean)

      get().recordEncounter(dnaIds, !wasCorrect)
    }
  },

  getWeakestDNA: () => {
    const { traps } = get().profile
    const results: Array<{ id: string; name: string; nameKo: string; rate: number; count: number }> = []

    for (const dna of WRONG_ANSWER_DNA_LIST) {
      const trap = traps[dna.id]
      if (!trap || trap.encountered === 0) continue
      results.push({
        id: dna.id,
        name: dna.name,
        nameKo: dna.nameKo,
        rate: trap.fellFor / trap.encountered,
        count: trap.encountered,
      })
    }

    return results.sort((a, b) => b.rate - a.rate)
  },

  buildProfileSummary: () => {
    const weakest = get().getWeakestDNA()
    if (weakest.length === 0) return '아직 데이터 없음 — 문제를 더 풀어보세요.'

    const lines = weakest.slice(0, 5).map((w, i) => {
      const pct = Math.round(w.rate * 100)
      return `${i + 1}. ${w.nameKo} (${w.name}): ${pct}% 함정 적중률 (${w.count}회 만남)`
    })

    return `오답 DNA 프로필 (총 ${get().profile.totalAnalyzed}문제 분석):\n${lines.join('\n')}`
  },

  resetProfile: () => {
    const traps: DNAProfile['traps'] = {}
    for (const dna of WRONG_ANSWER_DNA_LIST) {
      traps[dna.id] = { encountered: 0, fellFor: 0 }
    }
    const profile: DNAProfile = { traps, totalAnalyzed: 0, lastUpdated: new Date().toISOString() }
    saveProfile(profile)
    set({ profile })
  },
}))
