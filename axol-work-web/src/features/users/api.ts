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
import {
  DEMO_EMPLOYERS,
  DEMO_PROSPECTS,
  getDemoUser,
  isDemoUid,
  searchDemoUsers,
} from '@/data/demoFixtures'
import { useAuthStore } from '@/stores/authStore'
import { redactAccommodationsForViewer } from '@/features/users/privacy'

export { redactAccommodationsForViewer } from '@/features/users/privacy'

/**
 * Recruiters who opted into inclusive hiring.
 * Guest mode uses demo fixtures; signed-in mode queries Firestore.
 */
export async function listInclusiveHiringEmployers(max = 12): Promise<AppUser[]> {
  const viewerUID = useAuthStore.getState().user?.uid
  if (useAuthStore.getState().isGuest) {
    return DEMO_EMPLOYERS.filter((u) => u.employerProfile?.inclusiveHiringCommitted).map((u) =>
      redactAccommodationsForViewer(u, viewerUID),
    )
  }
  try {
    const snap = await getDocs(
      query(
        usersCollection(),
        where('employerProfile.inclusiveHiringCommitted', '==', true),
        limit(max),
      ),
    )
    return snap.docs
      .map((d) => redactAccommodationsForViewer(d.data(), viewerUID))
      .filter((u) => u.role === 'employer')
  } catch {
    // Missing index or rules — fail soft so home still loads.
    return []
  }
}

/** Fetch a single public user profile. */
export async function getUser(uid: string): Promise<AppUser | null> {
  const viewerUID = useAuthStore.getState().user?.uid
  const demo = getDemoUser(uid)
  if (demo) return redactAccommodationsForViewer(demo, viewerUID)
  if (isDemoUid(uid)) return null
  // Guests must not probe production profiles.
  if (useAuthStore.getState().isGuest) return null
  const snap = await getDoc(userDoc(uid))
  if (!snap.exists()) return null
  return redactAccommodationsForViewer(snap.data(), viewerUID)
}

/** Fetch many users by uid (chunked to Firestore's 30-item `in` limit). */
export async function getUsers(uids: string[]): Promise<AppUser[]> {
  const viewerUID = useAuthStore.getState().user?.uid
  const unique = [...new Set(uids)].filter(Boolean)
  const out: AppUser[] = []
  const remote: string[] = []
  const guest = useAuthStore.getState().isGuest
  for (const uid of unique) {
    const demo = getDemoUser(uid)
    if (demo) out.push(redactAccommodationsForViewer(demo, viewerUID))
    else if (!isDemoUid(uid) && !guest) remote.push(uid)
  }
  for (let i = 0; i < remote.length; i += 30) {
    const chunk = remote.slice(i, i + 30)
    if (!chunk.length) continue
    const snap = await getDocs(
      query(usersCollection(), where(documentId(), 'in', chunk)),
    )
    out.push(...snap.docs.map((d) => redactAccommodationsForViewer(d.data(), viewerUID)))
  }
  return out
}

/** Prefix search by display name (case-sensitive on first char, best-effort). */
export async function searchUsersByName(term: string): Promise<AppUser[]> {
  const viewerUID = useAuthStore.getState().user?.uid
  if (useAuthStore.getState().isGuest) {
    return searchDemoUsers(term).map((u) => redactAccommodationsForViewer(u, viewerUID))
  }
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
  return snap.docs.map((d) => redactAccommodationsForViewer(d.data(), viewerUID))
}

/**
 * Mentorship matching: find users who share work-history (industry) tags,
 * using `array-contains-any` (max 30 tags). Callers rank/exclude client-side.
 */
export async function findUsersByTags(tags: string[]): Promise<AppUser[]> {
  const viewerUID = useAuthStore.getState().user?.uid
  const t = tags.slice(0, 30)
  if (!t.length) return []
  if (useAuthStore.getState().isGuest) {
    const tagSet = new Set(t)
    return [...DEMO_EMPLOYERS, ...DEMO_PROSPECTS]
      .filter((u) => u.workHistoryTags.some((tag) => tagSet.has(tag)))
      .map((u) => redactAccommodationsForViewer(u, viewerUID))
  }
  const snap = await getDocs(
    query(usersCollection(), where('workHistoryTags', 'array-contains-any', t), limit(50)),
  )
  return snap.docs.map((d) => redactAccommodationsForViewer(d.data(), viewerUID))
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
    status: 'pending',
  })
}
