import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Check, X, MessageSquare, Search } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { AppUser, ConnectionRequest } from '@/models'
import { Avatar, Button, Card, EmptyState, Input, Modal, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { getUsers, searchUsersByName } from '@/features/users/api'
import { getOrCreateConversation } from '@/features/messaging/api'
import { ConnectionButton } from './ConnectionButton'
import {
  acceptConnectionRequest,
  cancelRequest,
  removeConnection,
  subscribeConnections,
} from './api'

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
        subtitle="Manage your connections and requests"
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
                Requests received ({incoming.length})
              </h2>
              <div className="flex flex-col gap-2">
                {incoming.map((r) => {
                  const p = profiles[r.fromUID]
                  const name = p?.displayName ?? r.otherUserName ?? 'Someone'
                  return (
                    <Card key={r.id} className="flex items-center justify-between gap-3">
                      <PersonInfo name={name} headline={p?.headline} onClick={() => navigate(`/u/${r.fromUID}`)} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => acceptConnectionRequest(r, { uid: me.uid, name: me.displayName })}>
                          <Check className="h-4 w-4" aria-hidden /> Accept
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => removeConnection(r)}>
                          <X className="h-4 w-4" aria-hidden /> Decline
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {outgoing.length > 0 && (
            <section aria-labelledby="outgoing-h">
              <h2 id="outgoing-h" className="mb-3 text-headline text-fg">
                Sent requests ({outgoing.length})
              </h2>
              <div className="flex flex-col gap-2">
                {outgoing.map((r) => {
                  const p = profiles[r.toUID]
                  return (
                    <Card key={r.id} className="flex items-center justify-between gap-3">
                      <PersonInfo name={p?.displayName ?? r.otherUserName ?? 'Pending'} headline="Pending…" onClick={() => navigate(`/u/${r.toUID}`)} />
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
              Your connections ({connected.length})
            </h2>
            {connected.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No connections yet"
                message="Find people to grow your network."
                action={<Button onClick={() => setFindOpen(true)}>Find people</Button>}
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {connected.map((r) => {
                  const uid = otherUID(r)
                  const p = profiles[uid]
                  return (
                    <Card key={r.id} className="flex items-center justify-between gap-3">
                      <PersonInfo name={p?.displayName ?? r.otherUserName ?? 'Connection'} headline={p?.headline} onClick={() => navigate(`/u/${uid}`)} />
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
