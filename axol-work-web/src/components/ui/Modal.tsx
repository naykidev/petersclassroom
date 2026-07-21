import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

/**
 * Centered modal dialog. Esc closes, focus moves in on open and is restored on
 * close, clicking the backdrop closes. Rendered with role=dialog + aria-modal.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the dialog.
    const t = window.setTimeout(() => panelRef.current?.focus(), 0)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
      document.body.style.overflow = ''
      restoreRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'w-full rounded-card bg-card shadow-elevated border border-border outline-none animate-scale-in',
          widths[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-headline text-fg">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="!min-h-0 h-9 w-9 !px-0"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
