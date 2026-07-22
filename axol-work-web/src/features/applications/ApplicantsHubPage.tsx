import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Check, X, Award, MessageSquare, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { ShiftApplication } from '@/models'
import { Avatar, Badge, Button, Card, EmptyState, Input, Modal, Select, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { relativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import {
  completeApplication,
  markApplicationViewed,
  respondToApplication,
  subscribeEmployerApplications,
} from './api'
import { ApplicationStatusBadge } from './ApplicationsPage'
import { getOrCreateConversation } from '@/features/messaging/api'

export function ApplicantsHubPage() {
  const { user } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [apps, setApps] = useState<ShiftApplication[] | null>(null)
  const [shiftFilter, setShiftFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [completeFor, setCompleteFor] = useState<ShiftApplication | null>(null)

  useEffect(() => subscribeEmployerApplications(me.uid, setApps), [me.uid])

  const shiftOptions = useMemo(() => {
    const map = new Map<string, string>()
    ;(apps ?? []).forEach((a) => map.set(a.shiftID, a.shiftTitle))
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [apps])

  const visible = (apps ?? []).filter((a) => !shiftFilter || a.shiftID === shiftFilter)
  const selected = visible.find((a) => a.id === selectedId) ?? null

  function open(app: ShiftApplication) {
    setSelectedId(app.id)
    markApplicationViewed(app)
  }

  async function message(app: ShiftApplication) {
    const id = await getOrCreateConversation(
      { uid: me.uid, name: me.employerProfile?.companyName ?? me.displayName },
      { uid: app.seekerUID, name: app.seekerName },
    )
    navigate(`/messages/${id}`)
  }

  const actorName = me.employerProfile?.companyName ?? me.displayName

  return (
    <div>
      <PageHeader
        title="Applicants"
        subtitle="Review and respond to applicants across your shifts"
        action={
          shiftOptions.length > 0 && (
            <div className="w-56">
              <Select
                options={[{ value: '', label: 'All shifts' }, ...shiftOptions]}
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                aria-label="Filter by shift"
              />
            </div>
          )
        }
      />

      {!apps ? (
        <Spinner label="Loading applicants" />
      ) : visible.length === 0 ? (
        <EmptyState icon={Inbox} title="No applicants yet" message="Applicants appear here once Prospects apply." />
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <ul className="flex flex-col gap-2">
            {visible.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => open(a)}
                  aria-current={a.id === selectedId}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-card border border-border bg-card p-3 text-left transition hover:bg-muted',
                    a.id === selectedId && 'ring-2 ring-brand',
                  )}
                >
                  <Avatar name={a.seekerName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-fg">{a.seekerName}</p>
                    <p className="truncate text-caption text-fg-muted">{a.shiftTitle}</p>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            {selected ? (
              <Card elevated className="sticky top-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.seekerName} size="lg" />
                  <div>
                    <h2 className="text-headline text-fg">{selected.seekerName}</h2>
                    <p className="text-sm text-fg-muted">
                      Applied to {selected.shiftTitle} · {relativeTime(selected.submittedAt)} ago
                    </p>
                    <div className="mt-1">
                      <ApplicationStatusBadge status={selected.status} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/u/${selected.seekerUID}`)}>
                    <ExternalLink className="h-4 w-4" aria-hidden /> View profile
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => message(selected)}>
                    <MessageSquare className="h-4 w-4" aria-hidden /> Message
                  </Button>
                </div>

                {(selected.status === 'submitted' || selected.status === 'viewed') && (
                  <div className="flex gap-2 border-t border-border pt-4">
                    <Button onClick={() => respondToApplication(selected, 'accepted', { uid: me.uid, name: actorName })}>
                      <Check className="h-4 w-4" aria-hidden /> Accept
                    </Button>
                    <Button variant="secondary" onClick={() => respondToApplication(selected, 'declined', { uid: me.uid, name: actorName })}>
                      <X className="h-4 w-4" aria-hidden /> Decline
                    </Button>
                  </div>
                )}
                {selected.status === 'accepted' && (
                  <div className="border-t border-border pt-4">
                    <Button onClick={() => setCompleteFor(selected)}>
                      <Award className="h-4 w-4" aria-hidden /> Mark completed
                    </Button>
                  </div>
                )}
                {selected.status === 'completed' && selected.hoursWorked != null && (
                  <Badge tone="success" icon={Award}>
                    Completed · {selected.hoursWorked} hours
                  </Badge>
                )}
              </Card>
            ) : (
              <EmptyState icon={Inbox} title="Select an applicant" message="Choose someone to review." />
            )}
          </div>
        </div>
      )}

      {completeFor && (
        <CompleteModal app={completeFor} onClose={() => setCompleteFor(null)} />
      )}
    </div>
  )
}

function CompleteModal({ app, onClose }: { app: ShiftApplication; onClose: () => void }) {
  const [hours, setHours] = useState('')
  const [saving, setSaving] = useState(false)
  const n = Number(hours)
  const valid = hours !== '' && !Number.isNaN(n) && n > 0

  async function save() {
    if (!valid) return
    setSaving(true)
    try {
      await completeApplication(app.id, n)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Mark shift completed"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!valid}>
            Complete
          </Button>
        </>
      }
    >
      <Input
        label="Hours worked"
        type="number"
        min="0"
        step="0.5"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        autoFocus
      />
    </Modal>
  )
}
