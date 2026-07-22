import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, MessageSquare, Search } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { AppUser, ConnectionRequest } from '@/models'
import { Avatar, Button, Card, EmptyState, Input, Modal, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { getUsers, searchUsersByName } from '@/features/users/api'
import { getOrCreateConversation } from '@/features/messaging/api'
import { ConnectionButton } from './ConnectionButton'
import {
  cancelRequest,
  subscribeConnections,
} from './api'
import { connectionCopy } from './labels'

export function NetworkPage() {
  const { user } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [records, setRecords] = useState<ConnectionRequest[] | null>(null)
  const [profiles, setProfiles] = useState<Record<string, AppUser>>({})
  const [findOpen, setFindOpen] = useState(false)

  useEffect(() => subscribeConnections(me.uid, setRecords), [me.uid])

  // Resolve the "other" user's profile for every record.
  useEffect(() => {
    if (!records) return
    const otherUIDs = records.map((r) => (r.fromUID === me.uid ? r.toUID : r.fromUID))
    const missing = otherUIDs.filter((u) => !profiles[u])
    if (!missing.length) return
    getUsers(missing).then((users) => {
      setProfiles((prev) => {
        const next = { ...prev }
        users.forEach((u) => (next[u.uid] = u))
        return next
      })
    })
  }, [records, me.uid, profiles])

  const blocked = new Set(me.blockedUIDs ?? [])
  const otherUID = (r: ConnectionRequest) => (r.fromUID === me.uid ? r.toUID : r.fromUID)

  const incoming = useMemo(
    () => (records ?? []).filter((r) => r.status === 'pending' && r.toUID === me.uid && !blocked.has(r.fromUID)),
    [records, me.uid, blocked],
  )
  const outgoing = useMemo(
    () => (records ?? []).filter((r) => r.status === 'pending' && r.fromUID === me.uid),
    [records, me.uid],
  )
  const connected = useMemo(
    () => (records ?? []).filter((r) => r.status === 'accepted' && !blocked.has(otherUID(r))),
    [records, blocked],
  )

  async function message(uid: string) {
    const p = profiles[uid]
    const id = await getOrCreateConversation(
      { uid: me.uid, name: me.displayName },
      { uid, name: p?.displayName ?? 'User' },
    )
    navigate(`/messages/${id}`)
  }

  return (
    <div>
      <PageHeader
        title="Network"
        subtitle="People you've scouted, expressed interest in, or reached out to"
        action={
          <Button onClick={() => setFindOpen(true)}>
            <Search className="h-4 w-4" aria-hidden /> Find people
          </Button>
        }
      />

      {!records ? (
        <Spinner label="Loading network" />
      ) : (
        <div className="flex flex-col gap-8">
          {incoming.length > 0 && (
            <section aria-labelledby="incoming-h">
              <h2 id="incoming-h" className="mb-3 text-headline text-fg">
                Incoming ({incoming.length})
              </h2>
              <div className="flex flex-col gap-2">
                {incoming.map((r) => {
                  const p = profiles[r.fromUID]
                  const name = p?.displayName ?? r.otherUserName ?? 'Someone'
                  return (
                    <Card key={r.id} className="flex items-center justify-between gap-3">
                      <PersonInfo name={name} headline={p?.headline} onClick={() => navigate(`/u/${r.fromUID}`)} />
                      <ConnectionButton
                        target={{
                          uid: r.fromUID,
                          displayName: name,
                          role: p?.role ?? 'unassigned',
                        }}
                        size="sm"
                      />
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {outgoing.length > 0 && (
            <section aria-labelledby="outgoing-h">
              <h2 id="outgoing-h" className="mb-3 text-headline text-fg">
                Pending ({outgoing.length})
              </h2>
              <div className="flex flex-col gap-2">
                {outgoing.map((r) => {
                  const p = profiles[r.toUID]
                  const name = p?.displayName ?? r.otherUserName ?? 'Pending'
                  const copy = connectionCopy(me.role, p?.role ?? 'unassigned')
                  return (
                    <Card key={r.id} className="flex items-center justify-between gap-3">
                      <PersonInfo
                        name={name}
                        headline={`${copy.sentLabel} · Pending`}
                        onClick={() => navigate(`/u/${r.toUID}`)}
                      />
                      <Button size="sm" variant="ghost" onClick={() => cancelRequest(r.id)}>
                        Cancel
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          <section aria-labelledby="conn-h">
            <h2 id="conn-h" className="mb-3 text-headline text-fg">
              Your network ({connected.length})
            </h2>
            {connected.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Your network is empty"
                message="Scout prospects, express interest in recruiters, or reach out to peers."
                action={<Button onClick={() => setFindOpen(true)}>Find people</Button>}
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {connected.map((r) => {
                  const uid = otherUID(r)
                  const p = profiles[uid]
                  return (
                    <Card key={r.id} className="flex items-center justify-between gap-3">
                      <PersonInfo name={p?.displayName ?? r.otherUserName ?? 'Member'} headline={p?.headline} onClick={() => navigate(`/u/${uid}`)} />
                      <Button size="sm" variant="secondary" onClick={() => message(uid)} aria-label={`Message ${p?.displayName ?? 'user'}`}>
                        <MessageSquare className="h-4 w-4" aria-hidden />
                      </Button>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {findOpen && <FindPeopleModal me={me} onClose={() => setFindOpen(false)} />}
    </div>
  )
}

function PersonInfo({
  name,
  headline,
  onClick,
}: {
  name: string
  headline?: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
      <Avatar name={name} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-fg hover:underline">{name}</p>
        {headline && <p className="truncate text-sm text-fg-muted">{headline}</p>}
      </div>
    </button>
  )
}

function FindPeopleModal({
  me,
  onClose,
}: {
  me: AppUser
  onClose: () => void
}) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<AppUser[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function run(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await searchUsersByName(term)
      setResults(r.filter((u) => u.uid !== me.uid && !(me.blockedUIDs ?? []).includes(u.uid)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Find people">
      <form onSubmit={run} className="mb-4 flex gap-2">
        <Input placeholder="Search by name…" value={term} onChange={(e) => setTerm(e.target.value)} className="flex-1" />
        <Button type="submit" loading={loading}>
          Search
        </Button>
      </form>
      {results === null ? (
        <p className="py-6 text-center text-sm text-fg-muted">Search for people by name.</p>
      ) : results.length === 0 ? (
        <p className="py-6 text-center text-sm text-fg-muted">No people found.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {results.map((u) => (
            <li key={u.uid} className="flex items-center justify-between gap-3 rounded-btn border border-border p-2">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={u.displayName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-fg">{u.displayName}</p>
                  {u.headline && <p className="truncate text-caption text-fg-muted">{u.headline}</p>}
                </div>
              </div>
              <ConnectionButton
                target={{ uid: u.uid, displayName: u.displayName, role: u.role }}
                size="sm"
              />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
