import { useState } from 'react'
import { Check, Clock, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import { useToastStore } from '@/stores/toastStore'
import type { UserRole } from '@/models'
import { Badge, Button } from '@/components/ui'
import { connectionCopy, IN_NETWORK_LABEL, acceptToast } from './labels'
import { acceptConnectionRequest, removeConnection, sendConnectionRequest } from './api'

interface Target {
  uid: string
  displayName: string
  role: UserRole
}

type Size = 'sm' | 'md' | 'lg'

/**
 * The one connection action across the app. Derives its state from the live
 * connection records and renders the themed copy for whoever is initiating:
 *
 *   idle      -> "Scout" / "Express interest" / "Reach out"
 *   outgoing  -> "Scouted · Pending" (disabled)
 *   incoming  -> "Accept" + "Decline"
 *   accepted  -> "In your network" badge
 *
 * Reuses the shared <Button>/<Badge> — no bespoke styles.
 */
export function ConnectionButton({
  target,
  size = 'md',
}: {
  target: Target
  size?: Size
}) {
  const { user } = useAuthStore()
  const me = user!
  const { connections } = useSocialStore()
  const push = useToastStore((s) => s.push)
  const [busy, setBusy] = useState(false)

  if (!me || target.uid === me.uid) return null

  const record = connections.find(
    (c) => c.fromUID === target.uid || c.toUID === target.uid,
  )
  const status = !record
    ? 'idle'
    : record.status === 'accepted'
      ? 'accepted'
      : record.fromUID === me.uid
        ? 'outgoing'
        : 'incoming'

  const copy = connectionCopy(me.role, target.role)

  async function initiate() {
    setBusy(true)
    try {
      await sendConnectionRequest(
        { uid: me.uid, name: me.displayName, role: me.role },
        { uid: target.uid, name: target.displayName, role: target.role },
      )
      push(copy.toast(target.displayName), 'success')
    } catch {
      push('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function accept() {
    if (!record) return
    setBusy(true)
    try {
      await acceptConnectionRequest(record, { uid: me.uid, name: me.displayName })
      push(acceptToast(target.displayName), 'success')
    } catch {
      push('Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function decline() {
    if (!record) return
    try {
      await removeConnection(record)
    } catch {
      push('Something went wrong. Please try again.', 'error')
    }
  }

  if (status === 'accepted') {
    return (
      <Badge tone="success" icon={Check}>
        {IN_NETWORK_LABEL}
      </Badge>
    )
  }

  if (status === 'outgoing') {
    return (
      <Button size={size} variant="secondary" disabled>
        <Clock className="h-4 w-4" aria-hidden />
        {copy.sentLabel} · Pending
      </Button>
    )
  }

  if (status === 'incoming') {
    return (
      <div className="flex gap-2">
        <Button size={size} onClick={accept} loading={busy}>
          <Check className="h-4 w-4" aria-hidden />
          Accept
        </Button>
        <Button size={size} variant="secondary" onClick={decline}>
          <X className="h-4 w-4" aria-hidden />
          Decline
        </Button>
      </div>
    )
  }

  // idle
  return (
    <Button size={size} onClick={initiate} loading={busy}>
      <copy.Icon className="h-4 w-4" aria-hidden />
      {copy.verb}
    </Button>
  )
}
