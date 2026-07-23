import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { AppUser } from '@/models'
import { Avatar, Card, Chip } from '@/components/ui'
import { InclusiveHiringBadge } from '@/components/InclusiveHiringBadge'
import { listInclusiveHiringEmployers } from '@/features/users/api'
import {
  accommodationSupportCount,
  isInclusiveHiringEmployer,
} from '@/utils/inclusiveHiring'

export function InclusiveEmployersStrip() {
  const [employers, setEmployers] = useState<AppUser[] | null>(null)

  useEffect(() => {
    let cancelled = false
    listInclusiveHiringEmployers(8).then((list) => {
      if (!cancelled) setEmployers(list.filter(isInclusiveHiringEmployer))
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!employers?.length) return null

  return (
    <section className="mb-8" aria-labelledby="inclusive-employers-heading">
      <div className="mb-3">
        <h2 id="inclusive-employers-heading" className="text-headline text-fg">
          Inclusive employers
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Recruiters who offer workplace supports and want to hire disabled and neurodivergent workers
        </p>
      </div>
      <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {employers.map((e) => {
          const name = e.employerProfile?.companyName ?? e.displayName
          const supports = accommodationSupportCount(e.employerProfile)
          return (
            <li key={e.uid} className="min-w-[240px] max-w-[280px] shrink-0">
              <Link
                to={`/u/${e.uid}`}
                className="block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Card className="h-full hover:border-brand/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar name={name} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-fg">{name}</h3>
                      <InclusiveHiringBadge className="mt-1" />
                      {e.selectedCity && (
                        <p className="mt-2 flex items-center gap-1 text-caption text-fg-muted">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {e.selectedCity}
                        </p>
                      )}
                      <div className="mt-2">
                        <Chip tone="neutral">
                          {supports} workplace support{supports === 1 ? '' : 's'}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
