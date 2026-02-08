import { useUIStore } from '@/stores/uiStore'

interface ModuleTransitionProps {
  completedModule: string
  nextModule: string
}

export function ModuleTransition({ completedModule, nextModule }: ModuleTransitionProps) {
  const { t } = useUIStore()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-600/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t.test.transition}</h2>
        <p className="text-slate-400">{t.test.transitionDesc}</p>
        <p className="text-sm text-slate-500">{completedModule} → {nextModule}</p>
      </div>
    </div>
  )
}
