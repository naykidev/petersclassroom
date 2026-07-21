import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COL, pairId, setDocAt, typedCollection } from '@/lib/firestore'
import type { ConnectionRequest, UserRole } from '@/models'
import { createNotification } from '@/features/notifications/api'
import { connectionCopy } from './labels'

interface ConnectionParty {
  uid: string
  name: string
  role: UserRole
}

/**
 * A connection between two users, keyed by the deterministic sorted pair id.
 * `fromUID` is the requester, `toUID` the recipient (matches deployed rules).
 *
 * Note: the rules only allow a user to write their OWN user doc, so
 * `connectionCount` is NOT maintained cross-user here — the UI derives the live
 * count from the connection records instead.
 */
export async function sendConnectionRequest(
  me: ConnectionParty,
  other: ConnectionParty,
): Promise<void> {
  const id = pairId(me.uid, other.uid)
  const existing = await getDoc(doc(db, COL.connectionRequests, id))
  if (existing.exists()) return
  await setDocAt<ConnectionRequest>(COL.connectionRequests, id, {
    fromUID: me.uid,
    toUID: other.uid,
    otherUserName: other.name,
    status: 'pending',
  })
  // Role-aware notification copy (e.g. "… scouted you").
  const copy = connectionCopy(me.role, other.role)
  await createNotification({
    recipientUID: other.uid,
    actorUID: me.uid,
    actorName: me.name,
    kind: 'connectionRequest',
    message: copy.notify(me.name),
    targetID: me.uid,
  })
}

/** Recipient accepts a pending request (only the `status` field may change). */
export async function acceptConnectionRequest(
  req: ConnectionRequest,
  me: { uid: string; name: string },
): Promise<void> {
  await updateDoc(doc(db, COL.connectionRequests, req.id), { status: 'accepted' })
  await createNotification({
    recipientUID: req.fromUID,
    actorUID: me.uid,
    actorName: me.name,
    kind: 'connectionAccepted',
    message: `${me.name} is now in your network`,
    targetID: me.uid,
  })
}

/** Decline a pending request or remove an existing connection (either party). */
export async function removeConnection(req: ConnectionRequest): Promise<void> {
  await deleteDoc(doc(db, COL.connectionRequests, req.id))
}

export async function cancelRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.connectionRequests, id))
}

/**
 * Live stream of every connection record touching a user, via two single-field
 * queries (fromUID / toUID) merged client-side. Callers split by status/direction.
 */
export function subscribeConnections(
  uid: string,
  cb: (records: ConnectionRequest[]) => void,
): () => void {
  const col = typedCollection<ConnectionRequest>(COL.connectionRequests)
  const byFrom = new Map<string, ConnectionRequest>()
  const byTo = new Map<string, ConnectionRequest>()

  const emit = () => cb([...new Map([...byFrom, ...byTo]).values()])

  const unsubFrom = onSnapshot(query(col, where('fromUID', '==', uid)), (snap) => {
    byFrom.clear()
    snap.docs.forEach((d) => byFrom.set(d.id, d.data()))
    emit()
  })
  const unsubTo = onSnapshot(query(col, where('toUID', '==', uid)), (snap) => {
    byTo.clear()
    snap.docs.forEach((d) => byTo.set(d.id, d.data()))
    emit()
  })
  return () => {
    unsubFrom()
    unsubTo()
  }
}
