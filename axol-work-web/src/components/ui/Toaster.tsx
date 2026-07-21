import { CheckCircle2, Info, XCircle, X, type LucideIcon } from 'lucide-react'
import { useToastStore, type ToastTone } from '@/stores/toastStore'
import { cn } from '@/utils/cn'

const ICONS: Record<ToastTone, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}
const ACCENT: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-brand',
}

/**
 * App-wide toast/snackbar host. Mounted once in the shell. Announces via
 * aria-live so screen-reader users hear confirmations (e.g. "You scouted …").
 */
export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.tone]
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex w-full max-w-sm animate-scale-in items-center gap-3 rounded-btn border border-border bg-card px-4 py-3 shadow-elevated"
          >
            <Icon className={cn('h-5 w-5 shrink-0', ACCENT[t.tone])} aria-hidden />
            <span className="flex-1 text-sm text-fg">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-muted hover:text-fg"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
