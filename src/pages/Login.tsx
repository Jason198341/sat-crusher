import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

export function Login() {
  const { t } = useUIStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await signInWithEmail(email, password)
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="max-w-sm w-full">
        <h1 className="text-2xl font-bold text-white text-center mb-6">{t.auth.login}</h1>

        {error && (
          <div role="alert" className="bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm text-slate-400 mb-1">{t.auth.email}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm text-slate-400 mb-1">{t.auth.password}</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">{t.auth.login}</Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="text-xs text-slate-500">{t.common.or}</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        <Button variant="secondary" className="w-full" onClick={() => signInWithGoogle()}>
          {t.auth.google}
        </Button>

        <p className="text-sm text-slate-400 text-center mt-4">
          {t.auth.noAccount}{' '}
          <Link to="/signup" className="text-brand-400 hover:underline">{t.auth.signup}</Link>
        </p>
      </Card>
    </div>
  )
}
