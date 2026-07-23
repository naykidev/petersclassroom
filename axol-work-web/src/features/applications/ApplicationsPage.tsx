import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Clock, Eye, Check, X, Award, RotateCcw, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { ApplicationStatus, ShiftApplication } from '@/models'
import { Badge, Button, Card, EmptyState, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { relativeTime } from '@/utils/format'
import { subscribeSeekerApplications, withdrawApplication } from './api'
import { getOrCreateConversation } from '@/features/messaging/api'

export const APP_STATUS_META: Record<
  ApplicationStatus,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' | 'warning'; icon: typeof Clock }
> = {
  submitted: { label: 'Submitted', tone: 'info', icon: Clock },
  viewed: { label: 'Viewed', tone: 'info', icon: Eye },
  accepted: { label: 'Accepted', tone: 'success', icon: Check },
  declined: { label: 'Declined', tone: 'danger', icon: X },
  completed: { label: 'Completed', tone: 'success', icon: Award },
  withdrawn: { label: 'Withdrawn', tone: 'neutral', icon: RotateCcw },
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const m = APP_STATUS_META[status]
  return (
    <Badge tone={m.tone} icon={m.icon}>
      {m.label}
    </Badge>
  )
}

export function ApplicationsPage() {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [apps, setApps] = useState<ShiftApplication[] | null>(isGuest ? [] : null)

  useEffect(() => {
    if (isGuest) {
      setApps([])
      return
    }
    return subscribeSeekerApplications(me.uid, setApps)
  }, [me.uid, isGuest])

  async function message(app: ShiftApplication) {
    if (usePreviewStore.getState().requireAccount('Create a free account to send messages.')) return
    const id = await getOrCreateConversation(
      { uid: me.uid, name: me.displayName },
      { uid: app.employerUID, name: app.employerName },
    )
    navigate(`/messages/${id}`)
  }

  function withdraw(appId: string) {
    if (usePreviewStore.getState().requireAccount('Create a free account to manage applications.')) return
    withdrawApplication(appId)
  }

  return (
    <div>
      <PageHeader title="My applications" subtitle="Track the shifts you’ve applied to" />
      {!apps ? (
        <Spinner label="Loading applications" />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={isGuest ? 'Preview mode' : 'No applications yet'}
          message={
            isGuest
              ? 'Sign up to apply for shifts and track them here.'
              : 'Apply to shifts from the Home tab and track them here.'
          }
          action={<Button onClick={() => navigate('/')}>Browse shifts</Button>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {apps.map((app) => (
            <li key={app.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-fg">{app.shiftTitle}</h3>
                  <p className="text-sm text-fg-muted">
                    {app.employerName} · applied {relativeTime(app.submittedAt)} ago
                  </p>
                  {app.status === 'completed' && app.hoursWorked != null && (
                    <p className="mt-1 text-caption text-fg-muted">
                      {app.hoursWorked} hours logged
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ApplicationStatusBadge status={app.status} />
                  <Button variant="ghost" size="sm" onClick={() => message(app)}>
                    <MessageSquare className="h-4 w-4" aria-hidden /> Message
                  </Button>
                  {app.status === 'submitted' && (
                    <Button variant="secondary" size="sm" onClick={() => withdraw(app.id)}>
                      Withdraw
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
