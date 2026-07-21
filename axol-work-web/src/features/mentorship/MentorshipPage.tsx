import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, UserPlus, MessageSquare, BadgeCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import type { AppUser } from '@/models'
import { Avatar, Badge, Button, Card, Chip, EmptyState, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { findUsersByTags } from '@/features/users/api'
import { getOrCreateConversation } from '@/features/messaging/api'
import { sendConnectionRequest } from '@/features/connections/api'

interface Match {
  user: AppUser
  shared: string[]
}

export function MentorshipPage() {
  const { user } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const { connectedUIDs } = useSocialStore()
  const [candidates, setCandidates] = useState<AppUser[] | null>(null)
  const [requested, setRequested] = useState<Set<string>>(new Set())

  useEffect(() => {
    findUsersByTags(me.workHistoryTags).then(setCandidates)
  }, [me.workHistoryTags])

  const connected = connectedUIDs(me.uid)
  const blocked = new Set(me.blockedUIDs ?? [])
  const myTags = new Set(me.workHistoryTags)

  const matches: Match[] = useMemo(() => {
    if (!candidates) return []
    return candidates
      .filter((u) => u.uid !== me.uid && !blocked.has(u.uid))
      .map((u) => ({ user: u, shared: u.workHistoryTags.filter((t) => myTags.has(t)) }))
      .filter((m) => m.shared.length > 0)
      // Verified/experienced people rank higher, then by shared-tag overlap.
      .sort((a, b) => {
        const va = a.user.isVerifiedEmployed ? 1 : 0
        const vb = b.user.isVerifiedEmployed ? 1 : 0
        if (vb !== va) return vb - va
        return b.shared.length - a.shared.length
      })
  }, [candidates, me.uid, blocked, myTags])

  async function connect(u: AppUser) {
    await sendConnectionRequest({ uid: me.uid, name: me.displayName }, { uid: u.uid, name: u.displayName })
    setRequested((s) => new Set(s).add(u.uid))
  }

  async function message(u: AppUser) {
    const id = await getOrCreateConversation(
      { uid: me.uid, name: me.displayName },
      { uid: u.uid, name: u.displayName },
    )
    navigate(`/messages/${id}`)
  }

  return (
    <div>
      <PageHeader
        title="Mentorship"
        subtitle="People who share your work background"
      />

      {me.workHistoryTags.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Add your experience first"
          message="Add work-history tags to your profile to find mentors and peers."
          action={<Button onClick={() => navigate('/profile')}>Edit profile</Button>}
        />
      ) : !candidates ? (
        <Spinner label="Finding matches" />
      ) : matches.length === 0 ? (
        <EmptyState icon={Sparkles} title="No matches yet" message="Check back as more people join." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map(({ user: u, shared }) => {
            const isConnected = connected.has(u.uid)
            const isRequested = requested.has(u.uid)
            return (
              <Card key={u.uid} className="flex flex-col gap-3">
                <button className="flex items-center gap-3 text-left" onClick={() => navigate(`/u/${u.uid}`)}>
                  <Avatar name={u.displayName} size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-fg hover:underline">{u.displayName}</p>
                      {u.isVerifiedEmployed && <BadgeCheck className="h-4 w-4 text-success" aria-label="Verified" />}
                    </div>
                    {u.headline && <p className="text-sm text-fg-muted">{u.headline}</p>}
                  </div>
                </button>
                <div>
                  <p className="mb-1 text-caption text-fg-muted">
                    {shared.length} shared {shared.length === 1 ? 'interest' : 'interests'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shared.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  {isConnected ? (
                    <Badge tone="success">Connected</Badge>
                  ) : (
                    <Button size="sm" disabled={isRequested} onClick={() => connect(u)}>
                      <UserPlus className="h-4 w-4" aria-hidden /> {isRequested ? 'Requested' : 'Connect'}
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => message(u)}>
                    <MessageSquare className="h-4 w-4" aria-hidden /> Message
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
