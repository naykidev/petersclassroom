import { Clock, BadgeCheck, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { WorkHistoryStatus } from '@/models'

const META: Record<
  WorkHistoryStatus,
  { label: string; tone: 'warning' | 'success' | 'danger'; icon: typeof Clock }
> = {
  pending: { label: 'Pending', tone: 'warning', icon: Clock },
  verified: { label: 'Verified', tone: 'success', icon: BadgeCheck },
  declined: { label: 'Declined', tone: 'danger', icon: XCircle },
}

export function WorkHistoryStatusBadge({ status }: { status: WorkHistoryStatus }) {
  const m = META[status]
  return (
    <Badge tone={m.tone} icon={m.icon}>
      {m.label}
    </Badge>
  )
}
