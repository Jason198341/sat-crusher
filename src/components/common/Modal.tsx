import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="relative bg-surface-light border border-surface-border rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 id="modal-title" className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              aria-label="모달 닫기"
              className="text-slate-400 hover:text-white text-xl"
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
