import {
  arrayRemove,
  arrayUnion,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  endAt,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  COL,
  createDoc,
  userDoc,
  usersCollection,
} from '@/lib/firestore'
import type { AppUser, Report, ReportTargetType } from '@/models'

/** Fetch a single public user profile. */
export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(userDoc(uid))
  return snap.exists() ? snap.data() : null
}

/** Fetch many users by uid (chunked to Firestore's 30-item `in` limit). */
export async function getUsers(uids: string[]): Promise<AppUser[]> {
  const unique = [...new Set(uids)].filter(Boolean)
  const out: AppUser[] = []
  for (let i = 0; i < unique.length; i += 30) {
    const chunk = unique.slice(i, i + 30)
    if (!chunk.length) continue
    const snap = await getDocs(
      query(usersCollection(), where(documentId(), 'in', chunk)),
    )
    out.push(...snap.docs.map((d) => d.data()))
  }
  return out
}

/** Prefix search by display name (case-sensitive on first char, best-effort). */
export async function searchUsersByName(term: string): Promise<AppUser[]> {
  const t = term.trim()
  if (!t) return []
  const HIGH = String.fromCharCode(0xf8ff) // terminates the prefix range
  const snap = await getDocs(
    query(
      usersCollection(),
      orderBy('displayName'),
      startAt(t),
      endAt(t + HIGH),
      limit(20),
    ),
  )
  return snap.docs.map((d) => d.data())
}

/**
 * Mentorship matching: find users who share work-history (industry) tags,
 * using `array-contains-any` (max 30 tags). Callers rank/exclude client-side.
 */
export async function findUsersByTags(tags: string[]): Promise<AppUser[]> {
  const t = tags.slice(0, 30)
  if (!t.length) return []
  const snap = await getDocs(
    query(usersCollection(), where('workHistoryTags', 'array-contains-any', t), limit(50)),
  )
  return snap.docs.map((d) => d.data())
}

/** Block a user — hides their content and profile for the blocker. */
export async function blockUser(meUID: string, targetUID: string): Promise<void> {
  await updateDoc(userDoc(meUID), { blockedUIDs: arrayUnion(targetUID) })
}

export async function unblockUser(meUID: string, targetUID: string): Promise<void> {
  await updateDoc(userDoc(meUID), { blockedUIDs: arrayRemove(targetUID) })
}

/** File a content/user report. */
export async function reportContent(input: {
  reporterUID: string
  targetType: ReportTargetType
  targetID: string
  reason: string
}): Promise<void> {
  await createDoc<Report>(COL.reports, {
    ...input,
    createdAt: serverTimestamp(),
    status: 'open',
  })
}
