import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ elevated, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-card border border-border p-4',
        elevated ? 'shadow-elevated' : 'shadow-card',
        className,
      )}
      {...props}
    />
  )
}

export function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-headline text-fg">{title}</h2>
      {action}
    </div>
  )
}
