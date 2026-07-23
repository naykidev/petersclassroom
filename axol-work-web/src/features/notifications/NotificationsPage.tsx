import { useNavigate } from 'react-router-dom'
import {
  Bell,
  UserPlus,
  UserCheck,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  MessageSquare,
  Mail,
  type LucideIcon,
} from 'lucide-react'
import { useSocialStore } from '@/stores/socialStore'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { AppNotification, NotificationKind } from '@/models'
import { Avatar, Button, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { relativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import { markAllNotificationsRead, markNotificationRead } from './api'

const ICONS: Record<NotificationKind, LucideIcon> = {
  connectionRequest: UserPlus,
  connectionAccepted: UserCheck,
  applicationAccepted: CheckCircle2,
  applicationDeclined: XCircle,
  workHistoryVerified: BadgeCheck,
  workHistoryDeclined: XCircle,
  postComment: MessageSquare,
  message: Mail,
}

function linkFor(n: AppNotification, isEmployer: boolean): string {
  switch (n.kind) {
    case 'connectionRequest':
    case 'connectionAccepted':
      return '/network'
    case 'applicationAccepted':
    case 'applicationDeclined':
      return isEmployer ? '/applicants' : '/applications'
    case 'workHistoryVerified':
    case 'workHistoryDeclined':
      return isEmployer ? '/company' : '/profile'
    case 'postComment':
      return '/community'
    case 'message':
      return n.targetID ? `/messages/${n.targetID}` : '/messages'
  }
}

export function NotificationsPage() {
  const { user } = useAuthStore()
  const { notifications } = useSocialStore()
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.isRead).length

  function open(n: AppNotification) {
    if (!n.isRead) {
      if (usePreviewStore.getState().requireAccount('Create a free account to manage notifications.')) return
      markNotificationRead(n.id)
    }
    navigate(linkFor(n, user?.role === 'employer'))
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'You’re all caught up'}
        action={
          unread > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (usePreviewStore.getState().requireAccount('Create a free account to manage notifications.')) {
                  return
                }
                markAllNotificationsRead(notifications)
              }}
            >
              Mark all read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="Activity will show up here."
        />
      ) : (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {notifications.map((n) => {
            const Icon = ICONS[n.kind]
            return (
              <li key={n.id}>
                <button
                  onClick={() => open(n)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-card border border-border p-3 text-left transition hover:bg-muted',
                    n.isRead ? 'bg-card' : 'bg-brand-tint/40',
                  )}
                >
                  <div className="relative">
                    <Avatar name={n.actorName} size="sm" />
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card text-brand">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', n.isRead ? 'text-fg-muted' : 'font-medium text-fg')}>
                      {n.message}
                    </p>
                    <p className="text-caption text-fg-muted">{relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
