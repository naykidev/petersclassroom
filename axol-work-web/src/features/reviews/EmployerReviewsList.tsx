import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import type { EmployerReview } from '@/models'
import { Avatar, Card, Chip, EmptyState, Spinner } from '@/components/ui'
import { relativeTime } from '@/utils/format'
import { subscribeEmployerReviews } from './api'

export function EmployerReviewsList({ employerUID }: { employerUID: string }) {
  const [reviews, setReviews] = useState<EmployerReview[] | null>(null)

  useEffect(() => subscribeEmployerReviews(employerUID, setReviews), [employerUID])

  if (!reviews) return <Spinner label="Loading reviews" />
  if (reviews.length === 0)
    return <EmptyState icon={Star} title="No reviews yet" message="Reviews from Prospects will appear here." />

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id}>
          <Card className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Avatar name={r.reviewerName} size="sm" />
              <div>
                <p className="text-sm font-semibold text-fg">{r.reviewerName}</p>
                <p className="text-caption text-fg-muted">{relativeTime(r.createdAt)} ago</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.ratingTags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            {r.optionalNote && <p className="text-sm text-fg">{r.optionalNote}</p>}
          </Card>
        </li>
      ))}
    </ul>
  )
}
