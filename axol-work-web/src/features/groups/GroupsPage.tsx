import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersRound, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { CommunityGroup } from '@/models'
import { Button, Card, EmptyState, Input, Modal, Spinner, TextArea } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { createGroup, joinGroup, leaveGroup, subscribeGroups } from './api'

export function GroupsPage() {
  const { user } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [groups, setGroups] = useState<CommunityGroup[] | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => subscribeGroups(setGroups), [])

  return (
    <div>
      <PageHeader
        title="Groups"
        subtitle="Join communities around shared interests"
        action={
          <Button onClick={() => setCreateOpen(true)}>
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
          action={<Button onClick={() => setCreateOpen(true)}>Create group</Button>}
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
                    onClick={() => (joined ? leaveGroup(g.id, me.uid) : joinGroup(g.id, me.uid))}
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

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const id = await createGroup({ uid: me.uid, name: me.displayName }, name.trim(), desc.trim())
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
          <Button onClick={save} loading={saving} disabled={!name.trim()}>Create</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Group name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextArea label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>
    </Modal>
  )
}
