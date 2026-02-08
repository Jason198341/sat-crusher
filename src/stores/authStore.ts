import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/types/user'
import type { User } from '@supabase/supabase-js'

/** When Supabase is not configured, use this mock user for dev mode */
const DEV_USER: User = {
  id: 'dev-local-user',
  email: 'dev@satcrusher.local',
  app_metadata: {},
  user_metadata: { display_name: 'Dev User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User

const DEV_PROFILE: Profile = {
  id: 'dev-local-user',
  email: 'dev@satcrusher.local',
  displayName: 'SAT Crusher Dev',
  targetScore: 1400,
  testDate: null,
  streak: 0,
  lastActiveDate: null,
  lang: 'ko',
  createdAt: new Date().toISOString(),
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  devMode: boolean
  setUser: (user: User | null) => void
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  devMode: !isSupabaseConfigured,

  setUser: (user) => set({ user }),

  fetchProfile: async () => {
    const { user, devMode } = get()
    if (!user) return set({ profile: null })
    if (devMode) return // dev profile already set

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      set({
        profile: {
          id: data.id,
          email: data.email,
          displayName: data.display_name,
          targetScore: data.target_score,
          testDate: data.test_date,
          streak: data.streak,
          lastActiveDate: data.last_active_date,
          lang: data.lang,
          createdAt: data.created_at,
        },
      })
    }
  },

  updateProfile: async (updates) => {
    const { user, profile, devMode } = get()
    if (!user || !profile) return

    if (!devMode) {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.targetScore !== undefined) dbUpdates.target_score = updates.targetScore
      if (updates.testDate !== undefined) dbUpdates.test_date = updates.testDate
      if (updates.lang !== undefined) dbUpdates.lang = updates.lang
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak
      if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName

      await supabase.from('profiles').update(dbUpdates).eq('id', user.id)
    }
    set({ profile: { ...profile, ...updates } })
  },

  initialize: async () => {
    // Dev mode — bypass Supabase auth, use local mock user
    if (!isSupabaseConfigured) {
      console.warn('[SAT Crusher] Supabase not configured — running in dev mode (auth bypassed)')
      set({ user: DEV_USER, profile: DEV_PROFILE, loading: false, initialized: true, devMode: true })
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false, initialized: true })

    if (session?.user) {
      await get().fetchProfile()
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user ?? null })
      if (session?.user) {
        await get().fetchProfile()
      } else {
        set({ profile: null })
      }
    })
  },
}))
