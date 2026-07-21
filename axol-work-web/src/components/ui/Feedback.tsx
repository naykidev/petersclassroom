import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Inline spinner with accessible label. */
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-8 text-fg-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/** Rectangular loading skeleton. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-chip bg-muted', className)}
    />
  )
}

/** Empty state with icon, message and optional action. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon?: LucideIcon
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-fg-muted">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
      )}
      <div>
        <p className="text-headline text-fg">{title}</p>
        {message && <p className="mt-1 text-sm text-fg-muted">{message}</p>}
      </div>
      {action}
    </div>
  )
}

/** Error state with retry. */
export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="min-h-touch rounded-btn bg-muted px-4 text-sm font-semibold text-fg hover:bg-border/60"
        >
          Try again
        </button>
      )}
    </div>
  )
}
