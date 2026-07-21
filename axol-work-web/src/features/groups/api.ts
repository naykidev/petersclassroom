import {
  arrayRemove,
  arrayUnion,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { COL, createDoc, typedCollection, typedDoc } from '@/lib/firestore'
import type { CommunityGroup } from '@/models'

/** Live stream of all community groups (newest first). */
export function subscribeGroups(
  cb: (groups: CommunityGroup[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedCollection<CommunityGroup>(COL.communityGroups),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

export function subscribeGroup(
  id: string,
  cb: (group: CommunityGroup | null) => void,
): () => void {
  return onSnapshot(typedDoc<CommunityGroup>(COL.communityGroups, id), (snap) =>
    cb(snap.data() ?? null),
  )
}

export async function getGroup(id: string): Promise<CommunityGroup | null> {
  const snap = await getDoc(typedDoc<CommunityGroup>(COL.communityGroups, id))
  return snap.exists() ? snap.data() : null
}

export async function createGroup(
  creator: { uid: string; name: string },
  name: string,
  groupDescription: string,
): Promise<string> {
  return createDoc<CommunityGroup>(COL.communityGroups, {
    name,
    groupDescription,
    creatorUID: creator.uid,
    creatorName: creator.name,
    memberUIDs: [creator.uid],
    memberCount: 1,
    createdAt: serverTimestamp(),
  })
}

export async function joinGroup(id: string, uid: string): Promise<void> {
  await updateDoc(typedDoc<CommunityGroup>(COL.communityGroups, id), {
    memberUIDs: arrayUnion(uid),
    memberCount: increment(1),
  })
}

export async function leaveGroup(id: string, uid: string): Promise<void> {
  await updateDoc(typedDoc<CommunityGroup>(COL.communityGroups, id), {
    memberUIDs: arrayRemove(uid),
    memberCount: increment(-1),
  })
}
