import { useEffect, useMemo, useState } from 'react'
import { MapPin, DollarSign, Clock, Search, Sparkles, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { Shift, ShiftApplication } from '@/models'
import { CITIES } from '@/models'
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Modal,
  Select,
  Skeleton,
} from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { shiftRange } from '@/utils/format'
import { accommodationFit, subscribeOpenShifts } from './api'
import { applyToShift, subscribeSeekerApplications } from '@/features/applications/api'

export function SeekerHome() {
  const { user } = useAuthStore()
  const me = user!
  const [shifts, setShifts] = useState<Shift[] | null>(null)
  const [apps, setApps] = useState<ShiftApplication[]>([])
  const [error, setError] = useState(false)
  const [city, setCity] = useState('')
  const [selected, setSelected] = useState<Shift | null>(null)

  useEffect(() => {
    setError(false)
    const unsub = subscribeOpenShifts(setShifts, () => setError(true))
    const unsubApps = subscribeSeekerApplications(me.uid, setApps)
    return () => {
      unsub()
      unsubApps()
    }
  }, [me.uid])

  const appliedShiftIDs = useMemo(
    () => new Set(apps.filter((a) => a.status !== 'withdrawn').map((a) => a.shiftID)),
    [apps],
  )

  const needs = me.accommodationNeeds ?? []
  const hasNeeds = needs.length > 0
  const blocked = new Set(me.blockedUIDs ?? [])

  const visible = useMemo(() => {
    if (!shifts) return []
    return shifts
      .filter((s) => !blocked.has(s.employerUID))
      .filter((s) => !city || s.city === city)
      .map((s) => ({ shift: s, fit: accommodationFit(needs, s.accommodationTags) }))
      .sort((a, b) => b.fit.matched - a.fit.matched)
  }, [shifts, city, needs, blocked])

  return (
    <div>
      <PageHeader
        title="Find work"
        subtitle={hasNeeds ? 'Sorted by how well each shift fits your needs' : 'Open shifts near you'}
        action={
          <div className="w-52">
            <Select
              options={CITIES}
              placeholder="All cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Filter by city"
            />
          </div>
        }
      />

      {error ? (
        <ErrorState message="Couldn’t load shifts." onRetry={() => window.location.reload()} />
      ) : !shifts ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="mt-3 h-4 w-1/2" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No open shifts"
          message={city ? `No shifts in ${city} right now.` : 'Check back soon for new shifts.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map(({ shift, fit }) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              fit={hasNeeds ? fit : null}
              applied={appliedShiftIDs.has(shift.id)}
              onOpen={() => setSelected(shift)}
            />
          ))}
        </div>
      )}

      {selected && (
        <ShiftDetailModal
          shift={selected}
          fit={hasNeeds ? accommodationFit(needs, selected.accommodationTags) : null}
          applied={appliedShiftIDs.has(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function FitBadge({ fit }: { fit: { matched: number; total: number } }) {
  return (
    <Badge tone={fit.matched > 0 ? 'success' : 'neutral'} icon={Sparkles}>
      {fit.matched} of {fit.total} needs met
    </Badge>
  )
}

function ShiftCard({
  shift,
  fit,
  applied,
  onOpen,
}: {
  shift: Shift
  fit: { matched: number; total: number } | null
  applied: boolean
  onOpen: () => void
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-fg">{shift.title}</h3>
          <p className="text-sm text-fg-muted">{shift.employerName}</p>
        </div>
        {fit && <FitBadge fit={fit} />}
      </div>
      <div className="flex flex-col gap-1 text-sm text-fg-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" aria-hidden /> {shift.city}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4" aria-hidden /> {shift.payRate}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden /> {shiftRange(shift.startTime, shift.endTime)}
        </span>
      </div>
      {shift.accommodationTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {shift.accommodationTags.slice(0, 3).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          {shift.accommodationTags.length > 3 && (
            <Chip tone="neutral">+{shift.accommodationTags.length - 3}</Chip>
          )}
        </div>
      )}
      <Button variant={applied ? 'secondary' : 'primary'} onClick={onOpen} disabled={applied}>
        {applied ? (
          <>
            <Check className="h-4 w-4" aria-hidden /> Applied
          </>
        ) : (
          'View & apply'
        )}
      </Button>
    </Card>
  )
}

function ShiftDetailModal({
  shift,
  fit,
  applied,
  onClose,
}: {
  shift: Shift
  fit: { matched: number; total: number } | null
  applied: boolean
  onClose: () => void
}) {
  const { user } = useAuthStore()
  const me = user!
  const [applying, setApplying] = useState(false)
  const [justApplied, setJustApplied] = useState(false)
  const isApplied = applied || justApplied

  async function apply() {
    setApplying(true)
    try {
      await applyToShift(shift, { uid: me.uid, name: me.displayName })
      setJustApplied(true)
    } finally {
      setApplying(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={shift.title}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={apply} loading={applying} disabled={isApplied}>
            {isApplied ? 'Applied' : 'Apply now'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-fg-muted">{shift.employerName}</p>
          {fit && <FitBadge fit={fit} />}
        </div>
        <p className="whitespace-pre-wrap text-sm text-fg">{shift.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Field label="City" value={shift.city} />
          <Field label="Pay" value={shift.payRate} />
          <Field label="Address" value={shift.address} />
          <Field label="When" value={shiftRange(shift.startTime, shift.endTime)} />
        </dl>
        {shift.accommodationTags.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-fg">Accommodations offered</p>
            <div className="flex flex-wrap gap-1.5">
              {shift.accommodationTags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-fg-muted">{label}</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  )
}
