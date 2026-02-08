import { create } from 'zustand'
import en from '@/data/i18n/en.json'
import ko from '@/data/i18n/ko.json'

type Lang = 'en' | 'ko'
type Translations = typeof en

interface UIState {
  lang: Lang
  sidebarOpen: boolean
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  t: Translations
  setLang: (lang: Lang) => void
  toggleSidebar: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

const translations: Record<Lang, Translations> = { en, ko: ko as unknown as Translations }

export const useUIStore = create<UIState>((set) => ({
  lang: 'ko',
  sidebarOpen: false,
  toast: null,
  t: translations.ko,

  setLang: (lang) => set({ lang, t: translations[lang] }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
  clearToast: () => set({ toast: null }),
}))
