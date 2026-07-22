import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  ACCOMMODATION_NEEDS,
  AVAILABILITY_OPTIONS,
  CITIES,
  WORK_HISTORY_TAGS,
} from '@/models'
import { Button, SelectChip, TextArea } from '@/components/ui'
import { cn } from '@/utils/cn'

interface Draft {
  selectedWorkTags: string[]
  selectedCity: string
  selectedAvailability: string[]
  selectedConstraints: string[]
  otherNotes: string
}

const STEPS = [
  { key: 'work', title: 'Your experience', help: 'Pick any kind of work you’ve done before.' },
  { key: 'city', title: 'Where you work', help: 'Choose the area you can work in.' },
  { key: 'availability', title: 'When you’re free', help: 'Select all that apply.' },
  { key: 'needs', title: 'What helps you thrive', help: 'We’ll match shifts to these needs.' },
  { key: 'notes', title: 'Anything else?', help: 'Optional — add context for Recruiters.' },
] as const

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function SeekerOnboarding() {
  const { user, updateUser, logOut } = useAuthStore()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    selectedWorkTags: user?.workHistoryTags ?? [],
    selectedCity: user?.selectedCity ?? '',
    selectedAvailability: user?.seekerOnboarding?.selectedAvailability ?? [],
    selectedConstraints: user?.accommodationNeeds ?? [],
    otherNotes: user?.seekerOnboarding?.otherNotes ?? '',
  })

  const current = STEPS[step]!
  const isLast = step === STEPS.length - 1
  const canNext = current.key === 'city' ? !!draft.selectedCity : true

  async function finish() {
    setSaving(true)
    try {
      await updateUser({
        workHistoryTags: draft.selectedWorkTags,
        selectedCity: draft.selectedCity,
        accommodationNeeds: draft.selectedConstraints,
        accommodationTags: draft.selectedConstraints,
        seekerOnboarding: { ...draft, stepIndex: STEPS.length },
        hasCompletedSeekerProfile: true,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-page p-6">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                'h-1.5 flex-1 rounded-full transition',
                i <= step ? 'bg-brand' : 'bg-muted',
              )}
            />
          ))}
        </div>

        <div className="rounded-card bg-card border border-border shadow-card p-6">
          <p className="text-caption font-semibold uppercase tracking-wide text-brand">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="mt-1 text-title-2 text-fg">{current.title}</h1>
          <p className="mt-1 text-fg-muted">{current.help}</p>

          <div className="mt-6">
            {current.key === 'work' && (
              <ChipGroup
                options={WORK_HISTORY_TAGS}
                selected={draft.selectedWorkTags}
                onToggle={(v) =>
                  setDraft((d) => ({ ...d, selectedWorkTags: toggle(d.selectedWorkTags, v) }))
                }
              />
            )}
            {current.key === 'city' && (
              <div role="radiogroup" className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <SelectChip
                    key={c}
                    label={c}
                    selected={draft.selectedCity === c}
                    onToggle={() => setDraft((d) => ({ ...d, selectedCity: c }))}
                  />
                ))}
              </div>
            )}
            {current.key === 'availability' && (
              <ChipGroup
                options={AVAILABILITY_OPTIONS}
                selected={draft.selectedAvailability}
                onToggle={(v) =>
                  setDraft((d) => ({
                    ...d,
                    selectedAvailability: toggle(d.selectedAvailability, v),
                  }))
                }
              />
            )}
            {current.key === 'needs' && (
              <ChipGroup
                options={ACCOMMODATION_NEEDS}
                selected={draft.selectedConstraints}
                onToggle={(v) =>
                  setDraft((d) => ({
                    ...d,
                    selectedConstraints: toggle(d.selectedConstraints, v),
                  }))
                }
              />
            )}
            {current.key === 'notes' && (
              <TextArea
                label="Notes for Recruiters (optional)"
                placeholder="e.g. I do my best work in the mornings and prefer written checklists."
                value={draft.otherNotes}
                onChange={(e) => setDraft((d) => ({ ...d, otherNotes: e.target.value }))}
              />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? logOut() : setStep((s) => s - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {isLast ? (
              <Button onClick={finish} loading={saving}>
                <Check className="h-4 w-4" aria-hidden />
                Finish
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Next
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <SelectChip
          key={o}
          label={o}
          selected={selected.includes(o)}
          onToggle={() => onToggle(o)}
        />
      ))}
    </div>
  )
}
