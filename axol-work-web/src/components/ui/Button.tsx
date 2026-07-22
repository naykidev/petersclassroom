import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-brand-fg shadow-brand-glow hover:brightness-110 active:brightness-95 active:scale-[0.98]',
  secondary:
    'bg-muted text-fg border border-border hover:bg-border/60 active:scale-[0.98]',
  ghost: 'bg-transparent text-fg hover:bg-muted active:scale-[0.98]',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95 active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-touch px-3 text-sm gap-1.5',
  md: 'min-h-touch px-4 text-sm gap-2',
  lg: 'min-h-touch px-6 py-3 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-btn font-semibold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
