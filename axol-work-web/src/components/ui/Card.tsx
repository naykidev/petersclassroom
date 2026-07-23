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
  id,
}: {
  title: string
  action?: React.ReactNode
  id?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 id={id} className="text-headline text-fg">
        {title}
      </h2>
      {action}
    </div>
  )
}
