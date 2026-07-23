import { HeartHandshake } from 'lucide-react'
import { Badge } from '@/components/ui'

/** Shown when a Recruiter opted in to inclusive hiring and offers ≥1 workplace support. */
export function InclusiveHiringBadge({ className }: { className?: string }) {
  return (
    <Badge tone="success" icon={HeartHandshake} className={className}>
      Inclusive hiring
    </Badge>
  )
}
