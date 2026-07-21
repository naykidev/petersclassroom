import { cn } from '@/utils/cn'

/** Generated initials/monogram avatar (no image storage). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// Deterministic hue from the name so the same person keeps a stable color.
function hue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
} as const

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: keyof typeof sizeMap
  className?: string
}) {
  const h = hue(name)
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none',
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: `hsl(${h} 55% 42%)` }}
    >
      {initials(name)}
    </div>
  )
}
