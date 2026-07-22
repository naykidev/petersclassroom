import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FieldWrap {
  label?: string
  error?: string
  hint?: string
}

const fieldClasses =
  'w-full min-h-touch rounded-btn bg-card border border-border px-3 py-2.5 text-fg ' +
  'placeholder:text-fg-muted ' +
  'focus:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand ' +
  'disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger'

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
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(fieldClasses, className)}
        {...props}
      />
    </Wrap>
  )
})
Input.displayName = 'Input'

/** Password field with an accessible show/hide toggle inside the input. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & FieldWrap
>(({ label = 'Password', error, hint, className, id, ...props }, ref) => {
  const gen = useId()
  const fieldId = id ?? gen
  const [visible, setVisible] = useState(false)

  return (
    <Wrap id={fieldId} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(fieldClasses, 'pr-12', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className={cn(
            'absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center',
            'rounded-btn text-fg-muted transition hover:bg-muted hover:text-fg',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          )}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" aria-hidden />
          ) : (
            <Eye className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>
    </Wrap>
  )
})
PasswordInput.displayName = 'PasswordInput'

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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(fieldClasses, 'resize-y', className)}
        {...props}
      />
    </Wrap>
  )
})
TextArea.displayName = 'TextArea'
