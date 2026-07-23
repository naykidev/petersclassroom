import { useEffect, useState } from 'react'
import { BadgeCheck, MapPin, Pencil, Plus, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { WorkHistoryEntry } from '@/models'
import {
  ACCOMMODATION_NEEDS,
  CITIES,
  WORK_HISTORY_TAGS,
} from '@/models'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Input,
  Modal,
  SectionHeader,
  Select,
  SelectChip,
} from '@/components/ui'
import { fullDate } from '@/utils/format'
import { subscribeSeekerWorkHistory } from '@/features/workHistory/api'
import { WorkHistoryStatusBadge } from '@/features/workHistory/WorkHistoryStatusBadge'
import { AddWorkHistoryModal } from '@/features/workHistory/AddWorkHistoryModal'
import { DEMO_SEEKER_WORK_HISTORY } from '@/data/demoFixtures'

export function ProfilePage() {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const { connectedUIDs } = useSocialStore()
  const connectionCount = connectedUIDs(me.uid).size
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [entries, setEntries] = useState<WorkHistoryEntry[] | null>(isGuest ? DEMO_SEEKER_WORK_HISTORY : null)

  useEffect(() => {
    if (isGuest) {
      setEntries(DEMO_SEEKER_WORK_HISTORY)
      return
    }
    return subscribeSeekerWorkHistory(me.uid, setEntries)
  }, [me.uid, isGuest])

  return (
    <div className="mx-auto max-w-3xl">
      <Card elevated className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={me.displayName} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-title-2 text-fg">{me.displayName}</h1>
                {me.isVerifiedEmployed && (
                  <Badge tone="success" icon={BadgeCheck}>
                    Verified
                  </Badge>
                )}
              </div>
              {me.headline && <p className="text-fg-muted">{me.headline}</p>}
              <div className="mt-1 flex items-center gap-3 text-sm text-fg-muted">
                {me.selectedCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden /> {me.selectedCity}
                  </span>
                )}
                <span>{connectionCount} in network</span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              if (usePreviewStore.getState().requireAccount('Create a free account to edit your profile.')) return
              setEditOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden /> Edit profile
          </Button>
        </div>

        {me.workHistoryTags.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-caption font-semibold uppercase text-fg-muted">Experience</p>
            <div className="flex flex-wrap gap-1.5">
              {me.workHistoryTags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
        )}

        {me.accommodationNeeds.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-caption font-semibold uppercase text-fg-muted">Accommodation needs</p>
            <div className="flex flex-wrap gap-1.5">
              {me.accommodationNeeds.map((t) => (
                <Chip key={t} tone="neutral">
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </Card>

      <SectionHeader
        title="Work history"
        action={
          <Button
            size="sm"
            onClick={() => {
              if (usePreviewStore.getState().requireAccount('Create a free account to add work history.')) return
              setAddOpen(true)
            }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Add
          </Button>
        }
      />
      {!entries ? null : entries.length === 0 ? (
        <Card>
          <div className="flex items-center gap-3 text-fg-muted">
            <Briefcase className="h-5 w-5" aria-hidden />
            <p className="text-sm">
              Add a job and request verification from the Recruiter to earn a Verified badge.
            </p>
          </div>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id}>
              <Card className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-fg">{e.jobTitle}</p>
                  <p className="text-sm text-fg-muted">{e.employerName}</p>
                  <p className="text-caption text-fg-muted">
                    {fullDate(e.startDate)} – {e.endDate ? fullDate(e.endDate) : 'Present'}
                  </p>
                </div>
                <WorkHistoryStatusBadge status={e.status} />
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      {addOpen && <AddWorkHistoryModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuthStore()
  const me = user!
  const [headline, setHeadline] = useState(me.headline)
  const [city, setCity] = useState(me.selectedCity)
  const [tags, setTags] = useState<string[]>(me.workHistoryTags)
  const [needs, setNeeds] = useState<string[]>(me.accommodationNeeds)
  const [saving, setSaving] = useState(false)

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v]

  async function save() {
    if (usePreviewStore.getState().requireAccount('Create a free account to edit your profile.')) return
    setSaving(true)
    try {
      await updateUser({
        headline,
        selectedCity: city,
        workHistoryTags: tags,
        accommodationNeeds: needs,
        accommodationTags: needs,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit profile"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Reliable warehouse worker" />
        <Select label="City" options={CITIES} placeholder="Select a city" value={city} onChange={(e) => setCity(e.target.value)} />
        <div>
          <p className="mb-2 text-sm font-semibold text-fg">Experience</p>
          <div className="flex flex-wrap gap-2">
            {WORK_HISTORY_TAGS.map((t) => (
              <SelectChip key={t} label={t} selected={tags.includes(t)} onToggle={() => setTags((l) => toggle(l, t))} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-fg">Accommodation needs</p>
          <div className="flex flex-wrap gap-2">
            {ACCOMMODATION_NEEDS.map((t) => (
              <SelectChip key={t} label={t} selected={needs.includes(t)} onToggle={() => setNeeds((l) => toggle(l, t))} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
