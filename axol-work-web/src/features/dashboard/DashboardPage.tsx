import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusSquare, Inbox, Building2, Briefcase, Clock, Award, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { Shift, ShiftApplication } from '@/models'
import { Button, Card } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { subscribeEmployerShifts } from '@/features/shifts/api'
import { subscribeEmployerApplications } from '@/features/applications/api'
import { DEMO_EMPLOYER_APPLICATIONS, DEMO_EMPLOYER_SHIFTS } from '@/data/demoFixtures'

export function DashboardPage() {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [shifts, setShifts] = useState<Shift[]>(isGuest ? DEMO_EMPLOYER_SHIFTS : [])
  const [apps, setApps] = useState<ShiftApplication[]>(isGuest ? DEMO_EMPLOYER_APPLICATIONS : [])

  useEffect(() => {
    if (isGuest) {
      setShifts(DEMO_EMPLOYER_SHIFTS)
      return
    }
    return subscribeEmployerShifts(me.uid, setShifts)
  }, [me.uid, isGuest])
  useEffect(() => {
    if (isGuest) {
      setApps(DEMO_EMPLOYER_APPLICATIONS)
      return
    }
    return subscribeEmployerApplications(me.uid, setApps)
  }, [me.uid, isGuest])

  const openShifts = shifts.filter((s) => s.status === 'open').length
  const filledShifts = shifts.filter((s) => s.status === 'filled').length
  const pendingApps = apps.filter((a) => a.status === 'submitted' || a.status === 'viewed').length
  const completed = apps.filter((a) => a.status === 'completed').length

  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    { label: 'Open shifts', value: openShifts, icon: Briefcase },
    { label: 'Filled shifts', value: filledShifts, icon: Award },
    { label: 'Applicants to review', value: pendingApps, icon: Clock },
    { label: 'Completed shifts', value: completed, icon: Award },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome${me.employerProfile?.companyName ? `, ${me.employerProfile.companyName}` : ''}`}
        subtitle="Here’s an overview of your hiring activity"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-brand-tint text-brand">
              <s.icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-title-2 text-fg">{s.value}</p>
            <p className="text-sm text-fg-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-headline text-fg">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard icon={PlusSquare} title="Post a shift" desc="Create a new shift listing" onClick={() => navigate('/shifts')} />
        <ActionCard icon={Inbox} title="Review applicants" desc={`${pendingApps} waiting`} onClick={() => navigate('/applicants')} />
        <ActionCard icon={Building2} title="Company profile" desc="Edit details & verifications" onClick={() => navigate('/company')} />
      </div>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <Card className="flex flex-col items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-btn bg-brand-tint text-brand">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-fg">{title}</p>
        <p className="text-sm text-fg-muted">{desc}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onClick} className="mt-auto">
        Open
      </Button>
    </Card>
  )
}
