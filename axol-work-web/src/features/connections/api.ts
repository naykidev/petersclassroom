import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  COL,
  pairId,
  setDocAt,
  typedCollection,
  userDoc,
} from '@/lib/firestore'
import type { ConnectionRequest } from '@/models'
import { createNotification } from '@/features/notifications/api'

/**
 * A connection between two users, keyed by the deterministic sorted pair id.
 * `userAUID` is the requester, `userBUID` the recipient.
 */
export async function sendConnectionRequest(
  me: { uid: string; name: string },
  other: { uid: string; name: string },
): Promise<void> {
  const id = pairId(me.uid, other.uid)
  const existing = await getDoc(doc(db, COL.connectionRequests, id))
  if (existing.exists()) return
  await setDocAt<ConnectionRequest>(COL.connectionRequests, id, {
    userAUID: me.uid,
    userBUID: other.uid,
    otherUserName: other.name,
    status: 'pending',
  })
  await createNotification({
    recipientUID: other.uid,
    actorUID: me.uid,
    actorName: me.name,
    kind: 'connectionRequest',
    message: `${me.name} wants to connect`,
    targetID: me.uid,
  })
}

/** Accept a pending request: flip status + bump both connection counts. */
export async function acceptConnectionRequest(
  req: ConnectionRequest,
  me: { uid: string; name: string },
): Promise<void> {
  const batch = writeBatch(db)
  batch.update(doc(db, COL.connectionRequests, req.id), { status: 'accepted' })
  batch.update(userDoc(req.userAUID), { connectionCount: increment(1) })
  batch.update(userDoc(req.userBUID), { connectionCount: increment(1) })
  await batch.commit()
  await createNotification({
    recipientUID: req.userAUID,
    actorUID: me.uid,
    actorName: me.name,
    kind: 'connectionAccepted',
    message: `${me.name} accepted your connection request`,
    targetID: me.uid,
  })
}

/** Decline a pending request or remove an existing connection. */
export async function removeConnection(req: ConnectionRequest): Promise<void> {
  if (req.status === 'accepted') {
    const batch = writeBatch(db)
    batch.delete(doc(db, COL.connectionRequests, req.id))
    batch.update(userDoc(req.userAUID), { connectionCount: increment(-1) })
    batch.update(userDoc(req.userBUID), { connectionCount: increment(-1) })
    await batch.commit()
  } else {
    await deleteDoc(doc(db, COL.connectionRequests, req.id))
  }
}

export async function cancelRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.connectionRequests, id))
}

/**
 * Live stream of every connection record touching a user (both sides), via two
 * single-field queries merged client-side (avoids composite indexes). Callers
 * split by status/direction.
 */
export function subscribeConnections(
  uid: string,
  cb: (records: ConnectionRequest[]) => void,
): () => void {
  const col = typedCollection<ConnectionRequest>(COL.connectionRequests)
  const byA = new Map<string, ConnectionRequest>()
  const byB = new Map<string, ConnectionRequest>()

  const emit = () => cb([...new Map([...byA, ...byB]).values()])

  const unsubA = onSnapshot(query(col, where('userAUID', '==', uid)), (snap) => {
    byA.clear()
    snap.docs.forEach((d) => byA.set(d.id, d.data()))
    emit()
  })
  const unsubB = onSnapshot(query(col, where('userBUID', '==', uid)), (snap) => {
    byB.clear()
    snap.docs.forEach((d) => byB.set(d.id, d.data()))
    emit()
  })
  return () => {
    unsubA()
    unsubB()
  }
}

/** Get the single connection record between two users, if any. */
export async function getConnection(
  uidA: string,
  uidB: string,
): Promise<ConnectionRequest | null> {
  const snap = await getDoc(
    doc(db, COL.connectionRequests, pairId(uidA, uidB)).withConverter({
      toFirestore: (x: ConnectionRequest) => x,
      fromFirestore: (s) => ({ ...(s.data() as ConnectionRequest), id: s.id }),
    }),
  )
  return snap.exists() ? snap.data() : null
}

/** Backfill an accepted status update (used defensively). */
export async function markAccepted(id: string): Promise<void> {
  await updateDoc(doc(db, COL.connectionRequests, id), { status: 'accepted' })
}
