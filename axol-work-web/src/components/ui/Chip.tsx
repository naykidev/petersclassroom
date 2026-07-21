import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Static informational chip (soft brand tint by default). */
export function Chip({
  children,
  tone = 'brand',
  className,
}: {
  children: React.ReactNode
  tone?: 'brand' | 'neutral'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2.5 py-1 text-caption font-semibold',
        tone === 'brand'
          ? 'bg-brand-tint text-brand'
          : 'bg-muted text-fg-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Toggleable selection chip (used across onboarding + filters). */
export function SelectChip({
  label,
  selected,
  onToggle,
  disabled,
}: {
  label: string
  selected: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'inline-flex min-h-touch items-center gap-1.5 rounded-chip px-3 py-2 text-sm font-medium transition',
        'disabled:opacity-50',
        selected
          ? 'bg-brand text-brand-fg'
          : 'bg-muted text-fg hover:bg-border/60 border border-border',
      )}
    >
      {selected && <Check className="h-4 w-4" aria-hidden />}
      {label}
    </button>
  )
}
