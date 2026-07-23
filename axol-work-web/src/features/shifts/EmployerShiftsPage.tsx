import { useEffect, useState } from 'react'
import { Plus, MapPin, DollarSign, Clock, PlusSquare, Pencil } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { Shift, ShiftStatus } from '@/models'
import { Badge, Button, Card, Chip, EmptyState, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { shiftRange } from '@/utils/format'
import { setShiftStatus, subscribeEmployerShifts } from './api'
import { ShiftFormModal } from './ShiftFormModal'

const STATUS_META: Record<ShiftStatus, { label: string; tone: 'success' | 'info' | 'neutral' }> = {
  open: { label: 'Open', tone: 'success' },
  filled: { label: 'Filled', tone: 'info' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

export function EmployerShiftsPage() {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const [shifts, setShifts] = useState<Shift[] | null>(isGuest ? [] : null)
  const [formShift, setFormShift] = useState<Shift | 'new' | null>(null)

  useEffect(() => {
    if (isGuest) {
      setShifts([])
      return
    }
    return subscribeEmployerShifts(me.uid, setShifts)
  }, [me.uid, isGuest])

  const sorted = (shifts ?? [])
    .slice()
    .sort((a, b) => (b.startTime?.toMillis() ?? 0) - (a.startTime?.toMillis() ?? 0))

  function openForm(shift: Shift | 'new') {
    if (usePreviewStore.getState().requireAccount('Create a free account to post and manage shifts.')) {
      return
    }
    setFormShift(shift)
  }

  function changeStatus(id: string, status: ShiftStatus) {
    if (usePreviewStore.getState().requireAccount('Create a free account to manage shifts.')) return
    void setShiftStatus(id, status)
  }

  return (
    <div>
      <PageHeader
        title="Your shifts"
        subtitle="Post and manage shifts"
        action={
          <Button onClick={() => openForm('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Post shift
          </Button>
        }
      />

      {!shifts ? (
        <Spinner label="Loading shifts" />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={PlusSquare}
          title="No shifts yet"
          message={
            isGuest
              ? 'Preview mode. Sign up as a Recruiter to post real shifts.'
              : 'Post your first shift to start receiving applicants.'
          }
          action={<Button onClick={() => openForm('new')}>Post a shift</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((shift) => (
            <Card key={shift.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-fg">{shift.title}</h3>
                  <Badge tone={STATUS_META[shift.status].tone}>{STATUS_META[shift.status].label}</Badge>
                </div>
                <Button variant="ghost" size="sm" aria-label="Edit shift" onClick={() => openForm(shift)}>
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <div className="flex flex-col gap-1 text-sm text-fg-muted">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden /> {shift.city}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" aria-hidden /> {shift.payRate}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden /> {shiftRange(shift.startTime, shift.endTime)}</span>
              </div>
              {shift.accommodationTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {shift.accommodationTags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              )}
              {shift.status !== 'cancelled' && (
                <div className="flex gap-2">
                  {shift.status === 'open' && (
                    <Button size="sm" variant="secondary" onClick={() => changeStatus(shift.id, 'filled')}>
                      Mark filled
                    </Button>
                  )}
                  {shift.status === 'filled' && (
                    <Button size="sm" variant="secondary" onClick={() => changeStatus(shift.id, 'open')}>
                      Reopen
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => changeStatus(shift.id, 'cancelled')}>
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {formShift && (
        <ShiftFormModal
          shift={formShift === 'new' ? undefined : formShift}
          onClose={() => setFormShift(null)}
        />
      )}
    </div>
  )
}
