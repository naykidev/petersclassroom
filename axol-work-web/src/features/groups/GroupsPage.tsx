import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersRound, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { CommunityGroup } from '@/models'
import { Button, Card, EmptyState, Input, Modal, Spinner, TextArea } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { createGroup, joinGroup, leaveGroup, subscribeGroups } from './api'
import { DEMO_GROUPS } from '@/data/demoFixtures'

export function GroupsPage() {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [groups, setGroups] = useState<CommunityGroup[] | null>(isGuest ? DEMO_GROUPS : null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (isGuest) {
      setGroups(DEMO_GROUPS)
      return
    }
    return subscribeGroups(setGroups)
  }, [isGuest])

  function openCreate() {
    if (usePreviewStore.getState().requireAccount('Create a free account to create a group.')) return
    setCreateOpen(true)
  }

  function toggleMembership(g: CommunityGroup, joined: boolean) {
    if (usePreviewStore.getState().requireAccount(joined ? 'Create a free account to leave groups.' : 'Create a free account to join groups.')) {
      return
    }
    if (joined) leaveGroup(g.id, me.uid)
    else joinGroup(g.id, me.uid)
  }

  return (
    <div>
      <PageHeader
        title="Groups"
        subtitle="Join communities around shared interests"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden /> Create group
          </Button>
        }
      />

      {!groups ? (
        <Spinner label="Loading groups" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No groups yet"
          message="Create the first community group."
          action={<Button onClick={openCreate}>Create group</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => {
            const joined = g.memberUIDs.includes(me.uid)
            return (
              <Card key={g.id} className="flex flex-col gap-3">
                <button className="text-left" onClick={() => navigate(`/groups/${g.id}`)}>
                  <h3 className="font-semibold text-fg hover:underline">{g.name}</h3>
                  <p className="line-clamp-2 text-sm text-fg-muted">{g.groupDescription}</p>
                </button>
                <div className="flex items-center justify-between">
                  <span className="text-caption text-fg-muted">
                    {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
                  </span>
                  <Button
                    size="sm"
                    variant={joined ? 'secondary' : 'primary'}
                    onClick={() => toggleMembership(g, joined)}
                  >
                    {joined ? 'Leave' : 'Join'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {createOpen && <CreateGroupModal onClose={() => setCreateOpen(false)} />}
    </div>
  )
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const trimmedName = name.trim()
  const trimmedDesc = desc.trim()
  const nameValid = trimmedName.length >= 3 && trimmedName.length <= 60
  const descValid = trimmedDesc.length >= 10 && trimmedDesc.length <= 280
  const canSave = nameValid && descValid

  async function save() {
    if (!canSave) return
    if (usePreviewStore.getState().requireAccount('Create a free account to create a group.')) return
    setSaving(true)
    try {
      const id = await createGroup({ uid: me.uid, name: me.displayName }, trimmedName, trimmedDesc)
      onClose()
      navigate(`/groups/${id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Create a group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!canSave}>Create</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          hint="3–60 characters"
          error={name && !nameValid ? 'Must be 3–60 characters.' : undefined}
        />
        <TextArea
          label="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={280}
          hint="10–280 characters"
          error={desc && !descValid ? 'Must be 10–280 characters.' : undefined}
        />
      </div>
    </Modal>
  )
}
