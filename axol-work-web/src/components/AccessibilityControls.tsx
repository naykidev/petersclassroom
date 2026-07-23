import {
  A11Y_FONT_OPTIONS,
  A11Y_SCALE_OPTIONS,
  useA11yStore,
  type A11yLineHeight,
  type A11ySpacing,
} from '@/stores/a11yStore'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

/** Shared accessibility controls for Settings and the quick Aa panel. */
export function AccessibilityControls({ compact = false }: { compact?: boolean }) {
  const {
    font,
    textScale,
    letterSpacing,
    lineHeight,
    highContrast,
    reduceMotion,
    underlineLinks,
    setFont,
    setTextScale,
    setLetterSpacing,
    setLineHeight,
    setHighContrast,
    setReduceMotion,
    setUnderlineLinks,
    reset,
  } = useA11yStore()

  return (
    <div className={cn('flex flex-col gap-5', compact && 'gap-4')}>
      <ControlGroup label="Readable font" hint="Fonts designed for clearer reading">
        <div className="flex flex-wrap gap-1 rounded-btn bg-muted p-1" role="group" aria-label="Readable font">
          {A11Y_FONT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              title={opt.hint}
              aria-pressed={font === opt.value}
              onClick={() => setFont(opt.value)}
              className={cn(
                'min-h-touch rounded-chip px-3 text-sm font-medium',
                font === opt.value ? 'bg-card text-fg shadow-card' : 'text-fg-muted hover:text-fg',
              )}
              style={
                opt.value === 'atkinson'
                  ? { fontFamily: "'Atkinson Hyperlegible', sans-serif" }
                  : opt.value === 'lexend'
                    ? { fontFamily: "'Lexend', sans-serif" }
                    : opt.value === 'opendyslexic'
                      ? { fontFamily: "'OpenDyslexic', sans-serif" }
                      : undefined
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup label="Text size" hint={`Currently ${textScale}%`}>
        <div className="flex flex-wrap gap-1 rounded-btn bg-muted p-1" role="group" aria-label="Text size">
          {A11Y_SCALE_OPTIONS.map((scale) => (
            <button
              key={scale}
              type="button"
              aria-pressed={textScale === scale}
              onClick={() => setTextScale(scale)}
              className={cn(
                'min-h-touch rounded-chip px-3 text-sm font-medium',
                textScale === scale ? 'bg-card text-fg shadow-card' : 'text-fg-muted hover:text-fg',
              )}
            >
              {scale}%
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup label="Letter spacing">
        <Segmented
          ariaLabel="Letter spacing"
          value={letterSpacing}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'wide', label: 'Wide' },
            { value: 'wider', label: 'Wider' },
          ]}
          onChange={(v) => setLetterSpacing(v as A11ySpacing)}
        />
      </ControlGroup>

      <ControlGroup label="Line spacing">
        <Segmented
          ariaLabel="Line spacing"
          value={lineHeight}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'relaxed', label: 'Relaxed' },
            { value: 'loose', label: 'Loose' },
          ]}
          onChange={(v) => setLineHeight(v as A11yLineHeight)}
        />
      </ControlGroup>

      <div className="flex flex-col gap-3">
        <ToggleRow
          label="High contrast"
          description="Stronger borders and text for low vision"
          checked={highContrast}
          onChange={setHighContrast}
        />
        <ToggleRow
          label="Reduce motion"
          description="Minimize animations and transitions"
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
        <ToggleRow
          label="Underline links"
          description="Make links easier to recognize"
          checked={underlineLinks}
          onChange={setUnderlineLinks}
        />
      </div>

      <div className="flex justify-end border-t border-border pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Reset accessibility
        </Button>
      </div>
    </div>
  )
}

function ControlGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-fg">{label}</p>
        {hint && <p className="text-caption text-fg-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Segmented({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-btn bg-muted p-1" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'min-h-touch flex-1 rounded-chip px-3 text-sm font-medium',
            value === opt.value ? 'bg-card text-fg shadow-card' : 'text-fg-muted hover:text-fg',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  const id = `a11y-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="flex items-center justify-between gap-3 rounded-btn border border-border px-3 py-2">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        <p className="text-caption text-fg-muted">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition',
          checked ? 'bg-brand' : 'bg-muted border border-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition',
            checked ? 'left-5' : 'left-0.5',
          )}
          aria-hidden
        />
      </button>
    </div>
  )
}
