import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { signOut } from '@/lib/supabase'

export function Navbar() {
  const { t, lang, setLang } = useUIStore()
  const { user, profile } = useAuthStore()
  const location = useLocation()

  const navItems = [
    { to: '/dashboard', label: t.nav.dashboard },
    { to: '/practice', label: t.nav.practice },
    { to: '/mock-test', label: t.nav.mockTest },
    { to: '/tutor', label: t.nav.tutor },
    { to: '/review', label: t.nav.review },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-surface-light border-b border-surface-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 text-xl font-bold">
          <span className="bg-brand-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold">SC</span>
          <span className="text-white">SAT Crusher</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
            className="px-2 py-1 rounded text-xs font-medium bg-surface-lighter text-slate-300 hover:text-white transition-colors"
          >
            {lang === 'en' ? 'KR' : 'EN'}
          </button>

          {user && (
            <>
              <span className="text-sm text-slate-400 hidden sm:inline">
                {profile?.displayName || user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-slate-400 hover:text-danger-400 transition-colors"
              >
                {t.nav.logout}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
