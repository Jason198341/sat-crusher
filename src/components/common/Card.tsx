interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-surface-light rounded-xl border border-surface-border ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
