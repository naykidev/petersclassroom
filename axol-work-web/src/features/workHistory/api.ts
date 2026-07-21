import {
  arrayUnion,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  Timestamp,
  doc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  COL,
  createDoc,
  typedCollection,
  typedDoc,
  userDoc,
  verificationId,
} from '@/lib/firestore'
import type { EmploymentVerification, WorkHistoryEntry } from '@/models'
import { createNotification } from '@/features/notifications/api'

/** Seeker requests verification of a work-history claim against an employer. */
export async function requestWorkHistory(input: {
  seeker: { uid: string; name: string }
  employer: { uid: string; name: string }
  jobTitle: string
  startDate: Date
  endDate: Date | null
}): Promise<string> {
  return createDoc<WorkHistoryEntry>(COL.workHistoryEntries, {
    seekerUID: input.seeker.uid,
    seekerName: input.seeker.name,
    employerUID: input.employer.uid,
    employerName: input.employer.name,
    jobTitle: input.jobTitle,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: input.endDate ? Timestamp.fromDate(input.endDate) : null,
    status: 'pending',
    requestedAt: serverTimestamp(),
    respondedAt: null,
  })
}

export function subscribeSeekerWorkHistory(
  seekerUID: string,
  cb: (entries: WorkHistoryEntry[]) => void,
): () => void {
  const q = query(
    typedCollection<WorkHistoryEntry>(COL.workHistoryEntries),
    where('seekerUID', '==', seekerUID),
    orderBy('requestedAt', 'desc'),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}

export function subscribeEmployerVerificationRequests(
  employerUID: string,
  cb: (entries: WorkHistoryEntry[]) => void,
): () => void {
  const q = query(
    typedCollection<WorkHistoryEntry>(COL.workHistoryEntries),
    where('employerUID', '==', employerUID),
    orderBy('requestedAt', 'desc'),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}

/**
 * Employer confirms or denies a work-history claim. Confirming writes an
 * `employmentVerifications` doc (deterministic id) and flips the seeker's
 * `isVerifiedEmployed` + `verifiedEmployerUIDs`.
 */
export async function respondToWorkHistory(
  entry: WorkHistoryEntry,
  decision: 'verified' | 'declined',
  employer: { uid: string; name: string },
): Promise<void> {
  const batch = writeBatch(db)
  batch.update(typedDoc<WorkHistoryEntry>(COL.workHistoryEntries, entry.id), {
    status: decision,
    respondedAt: serverTimestamp(),
  })

  if (decision === 'verified') {
    const vid = verificationId(entry.employerUID, entry.seekerUID)
    batch.set(doc(db, COL.employmentVerifications, vid), {
      employerUID: entry.employerUID,
      seekerUID: entry.seekerUID,
      createdAt: serverTimestamp(),
    })
    batch.update(userDoc(entry.seekerUID), {
      isVerifiedEmployed: true,
      verifiedEmployerUIDs: arrayUnion(entry.employerUID),
    })
  }

  await batch.commit()

  await createNotification({
    recipientUID: entry.seekerUID,
    actorUID: employer.uid,
    actorName: employer.name,
    kind: decision === 'verified' ? 'workHistoryVerified' : 'workHistoryDeclined',
    message:
      decision === 'verified'
        ? `${employer.name} verified your work history`
        : `${employer.name} declined your work-history request`,
    targetID: entry.id,
  })
}

/** Existence check used defensively by UIs. */
export type { EmploymentVerification }
