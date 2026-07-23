import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UsersRound, Flag } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { CommunityGroup } from '@/models'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { ReportModal } from '@/components/ReportModal'
import { Feed } from '@/features/feed/Feed'
import { joinGroup, leaveGroup, subscribeGroup } from './api'

export function GroupDetailPage() {
  const { groupId } = useParams()
  const { user } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [group, setGroup] = useState<CommunityGroup | null | undefined>(undefined)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    if (!groupId) return
    return subscribeGroup(groupId, setGroup)
  }, [groupId])

  if (group === undefined) return <Spinner label="Loading group" />
  if (group === null)
    return <EmptyState icon={UsersRound} title="Group not found" message="This group doesn’t exist." />

  const current = group
  const joined = current.memberUIDs.includes(me.uid)

  function toggleMembership() {
    if (
      usePreviewStore
        .getState()
        .requireAccount(joined ? 'Create a free account to leave groups.' : 'Create a free account to join groups.')
    ) {
      return
    }
    if (joined) leaveGroup(current.id, me.uid)
    else joinGroup(current.id, me.uid)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate('/groups')}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> All groups
      </button>

      <Card elevated className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-title-2 text-fg">{group.name}</h1>
            <p className="mt-1 text-fg-muted">{group.groupDescription}</p>
            <p className="mt-2 text-caption text-fg-muted">
              {group.memberCount} member{group.memberCount === 1 ? '' : 's'} · created by {group.creatorName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button variant={joined ? 'secondary' : 'primary'} onClick={toggleMembership}>
              {joined ? 'Leave' : 'Join'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (usePreviewStore.getState().requireAccount('Create a free account to report content.')) return
                setReportOpen(true)
              }}
            >
              <Flag className="h-4 w-4" aria-hidden /> Report
            </Button>
          </div>
        </div>
      </Card>

      {!joined && (
        <Card className="mb-4 text-center text-sm text-fg-muted">
          Join this group to post in the discussion.
        </Card>
      )}

      <Feed groupID={group.id} canPost={joined} />

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="group" targetID={group.id} />
    </div>
  )
}
