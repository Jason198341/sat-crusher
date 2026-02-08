import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Toast } from '@/components/common/Toast'

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}
