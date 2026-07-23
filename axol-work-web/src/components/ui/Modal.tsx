import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

/**
 * Centered modal dialog. Esc closes, focus is trapped inside, restored on close,
 * backdrop click closes. Rendered with role=dialog + aria-modal.
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
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`).current

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement

    const focusables = () => {
      const root = panelRef.current
      if (!root) return [] as HTMLElement[]
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const nodes = focusables()
      if (!nodes.length) {
        e.preventDefault()
        panelRef.current?.focus()
        return
      }
      const first = nodes[0]!
      const last = nodes[nodes.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => {
      const nodes = focusables()
      ;(nodes[0] ?? panelRef.current)?.focus()
    }, 0)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'w-full rounded-card border border-border bg-card shadow-elevated outline-none animate-scale-in',
          widths[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 id={titleId} className="text-headline text-fg">
            {title}
          </h2>
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
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>
        )}
      </div>
    </div>
  )
}
