import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Dashboard } from '@/pages/Dashboard'
import { Practice } from '@/pages/Practice'
import { MockTest } from '@/pages/MockTest'
import { Tutor } from '@/pages/Tutor'
import { Review } from '@/pages/Review'

export function App() {
  // Initialize auth on app mount
  useAuth()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/practice"
          element={<ProtectedRoute><Practice /></ProtectedRoute>}
        />
        <Route
          path="/mock-test"
          element={<ProtectedRoute><MockTest /></ProtectedRoute>}
        />
        <Route
          path="/tutor"
          element={<ProtectedRoute><Tutor /></ProtectedRoute>}
        />
        <Route
          path="/review"
          element={<ProtectedRoute><Review /></ProtectedRoute>}
        />
      </Route>
    </Routes>
  )
}
