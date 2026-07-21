import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: readonly string[] | { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const gen = useId()
    const fieldId = id ?? gen
    const opts = options.map((o) =>
      typeof o === 'string' ? { value: o, label: o } : o,
    )
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-semibold text-fg">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            'min-h-touch w-full rounded-btn bg-card border border-border px-3 text-fg',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand',
            'aria-[invalid=true]:border-danger',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'
