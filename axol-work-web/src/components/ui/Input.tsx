import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface FieldWrap {
  label?: string
  error?: string
  hint?: string
}

const fieldClasses =
  'w-full rounded-btn bg-card border border-border px-3 py-2.5 text-fg placeholder:text-fg-muted ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand ' +
  'disabled:opacity-50 aria-[invalid=true]:border-danger'

function Wrap({
  id,
  label,
  error,
  hint,
  children,
}: FieldWrap & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldWrap
>(({ label, error, hint, className, id, ...props }, ref) => {
  const gen = useId()
  const fieldId = id ?? gen
  return (
    <Wrap id={fieldId} label={label} error={error} hint={hint}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(fieldClasses, className)}
        {...props}
      />
    </Wrap>
  )
})
Input.displayName = 'Input'

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrap
>(({ label, error, hint, className, id, rows = 4, ...props }, ref) => {
  const gen = useId()
  const fieldId = id ?? gen
  return (
    <Wrap id={fieldId} label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(fieldClasses, 'resize-y', className)}
        {...props}
      />
    </Wrap>
  )
})
TextArea.displayName = 'TextArea'
