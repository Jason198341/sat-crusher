import { useUIStore } from '@/stores/uiStore'

export function Toast() {
  const { toast, clearToast } = useUIStore()
  if (!toast) return null

  const colors = {
    success: 'bg-success-600',
    error: 'bg-danger-600',
    info: 'bg-brand-600',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-[slideUp_0.3s_ease-out]">
      <div
        className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}
      >
        <span className="text-sm">{toast.message}</span>
        <button onClick={clearToast} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
      </div>
    </div>
  )
}
