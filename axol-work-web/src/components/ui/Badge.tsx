import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'

const tones: Record<Tone, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  neutral: 'bg-muted text-fg-muted',
  brand: 'bg-brand-tint text-brand',
}

/**
 * Status badge. Always pairs color with text (and an optional icon) so color
 * is never the sole signal — WCAG requirement for this product.
 */
export function Badge({
  children,
  tone = 'neutral',
  icon: Icon,
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  icon?: LucideIcon
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-semibold',
        tones[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  )
}
