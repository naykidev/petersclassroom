import { useEffect, useState } from 'react'
import { Building2, Check, X, BadgeCheck, MapPin, Pencil } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { WorkHistoryEntry } from '@/models'
import { Avatar, Badge, Button, Card, Chip, Input, Modal, SectionHeader, Spinner } from '@/components/ui'
import { fullDate } from '@/utils/format'
import { EmployerReviewsList } from '@/features/reviews/EmployerReviewsList'
import { respondToWorkHistory, subscribeEmployerVerificationRequests } from '@/features/workHistory/api'
import { DEMO_VERIFICATION_REQUESTS } from '@/data/demoFixtures'

export function CompanyPage() {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const [requests, setRequests] = useState<WorkHistoryEntry[] | null>(
    isGuest ? DEMO_VERIFICATION_REQUESTS : null,
  )
  const [editOpen, setEditOpen] = useState(false)
  const profile = me.employerProfile

  useEffect(() => {
    if (isGuest) {
      setRequests(DEMO_VERIFICATION_REQUESTS)
      return
    }
    return subscribeEmployerVerificationRequests(me.uid, setRequests)
  }, [me.uid, isGuest])

  const pending = (requests ?? []).filter((r) => r.status === 'pending')
  const actor = { uid: me.uid, name: profile?.companyName ?? me.displayName }

  function respond(r: WorkHistoryEntry, status: 'verified' | 'declined') {
    if (usePreviewStore.getState().requireAccount('Create a free account to respond to verification requests.')) {
      return
    }
    respondToWorkHistory(r, status, actor)
  }

  const accommodations = [
    profile?.allowsNoiseCancelingHeadphones && 'Headphones allowed',
    profile?.offersSeatedWorkstations && 'Seated workstations',
    profile?.offersStructuredNonverbalTraining && 'Structured training',
  ].filter(Boolean) as string[]

  return (
    <div className="mx-auto max-w-3xl">
      <Card elevated className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={profile?.companyName ?? me.displayName} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-title-2 text-fg">{profile?.companyName ?? me.displayName}</h1>
                <Badge tone="brand" icon={Building2}>Recruiter</Badge>
              </div>
              {profile?.workplaceAddress && (
                <p className="mt-1 flex items-center gap-1 text-sm text-fg-muted">
                  <MapPin className="h-4 w-4" aria-hidden /> {profile.workplaceAddress}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              if (usePreviewStore.getState().requireAccount('Create a free account to edit your company profile.')) {
                return
              }
              setEditOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden /> Edit
          </Button>
        </div>
        {accommodations.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-caption font-semibold uppercase text-fg-muted">Accommodations offered</p>
            <div className="flex flex-wrap gap-1.5">
              {accommodations.map((a) => (
                <Chip key={a}>{a}</Chip>
              ))}
            </div>
          </div>
        )}
      </Card>

      <SectionHeader title={`Verification requests${pending.length ? ` (${pending.length})` : ''}`} />
      {!requests ? (
        <Spinner />
      ) : pending.length === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">No pending work-history verification requests.</p>
        </Card>
      ) : (
        <ul className="mb-8 flex flex-col gap-2">
          {pending.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-fg">{r.seekerName}</p>
                  <p className="text-sm text-fg-muted">{r.jobTitle}</p>
                  <p className="text-caption text-fg-muted">
                    {fullDate(r.startDate)} – {r.endDate ? fullDate(r.endDate) : 'Present'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(r, 'verified')}>
                    <BadgeCheck className="h-4 w-4" aria-hidden /> Confirm
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => respond(r, 'declined')}>
                    <X className="h-4 w-4" aria-hidden /> Deny
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <SectionHeader title="Reviews" />
      <EmployerReviewsList employerUID={me.uid} />

      {editOpen && <EditCompanyModal onClose={() => setEditOpen(false)} />}
    </div>
  )
}

function EditCompanyModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuthStore()
  const me = user!
  const p = me.employerProfile
  const [companyName, setCompanyName] = useState(p?.companyName ?? '')
  const [address, setAddress] = useState(p?.workplaceAddress ?? '')
  const [headphones, setHeadphones] = useState(p?.allowsNoiseCancelingHeadphones ?? false)
  const [seated, setSeated] = useState(p?.offersSeatedWorkstations ?? false)
  const [training, setTraining] = useState(p?.offersStructuredNonverbalTraining ?? false)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (usePreviewStore.getState().requireAccount('Create a free account to edit your company profile.')) return
    setSaving(true)
    try {
      await updateUser({
        headline: companyName,
        employerProfile: {
          companyName,
          workplaceAddress: address,
          allowsNoiseCancelingHeadphones: headphones,
          offersSeatedWorkstations: seated,
          offersStructuredNonverbalTraining: training,
        },
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const toggles: [string, boolean, (b: boolean) => void][] = [
    ['Noise-canceling headphones allowed', headphones, setHeadphones],
    ['Seated workstations available', seated, setSeated],
    ['Structured / non-verbal training', training, setTraining],
  ]

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit company"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <Input label="Workplace address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-fg">Accommodations offered</legend>
          {toggles.map(([label, val, set]) => (
            <label key={label} className="flex cursor-pointer items-center gap-2 rounded-btn border border-border p-2 hover:bg-muted">
              <input type="checkbox" className="h-5 w-5 accent-brand" checked={val} onChange={(e) => set(e.target.checked)} />
              <span className="text-sm text-fg">{label}</span>
              {val && <Check className="ml-auto h-4 w-4 text-brand" aria-hidden />}
            </label>
          ))}
        </fieldset>
      </div>
    </Modal>
  )
}
