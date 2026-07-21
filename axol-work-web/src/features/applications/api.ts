import {
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { COL, createDoc, typedCollection, typedDoc } from '@/lib/firestore'
import type { Shift, ShiftApplication } from '@/models'
import { createNotification } from '@/features/notifications/api'
import { setShiftStatus } from '@/features/shifts/api'

/** Apply to a shift (creates a `shiftApplication` in `submitted` state). */
export async function applyToShift(
  shift: Shift,
  seeker: { uid: string; name: string },
): Promise<string> {
  // No notification on apply — the employer's Applicants hub is real-time, and
  // the fixed notification `kind` set (shared with iOS) has no "applied" bucket.
  return createDoc<ShiftApplication>(COL.shiftApplications, {
    shiftID: shift.id,
    shiftTitle: shift.title,
    employerUID: shift.employerUID,
    employerName: shift.employerName,
    seekerUID: seeker.uid,
    seekerName: seeker.name,
    status: 'submitted',
    submittedAt: serverTimestamp(),
    respondedAt: null,
    completedAt: null,
    hoursWorked: null,
  })
}

/** Live stream of a seeker's own applications (newest first). */
export function subscribeSeekerApplications(
  seekerUID: string,
  cb: (apps: ShiftApplication[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedCollection<ShiftApplication>(COL.shiftApplications),
    where('seekerUID', '==', seekerUID),
    orderBy('submittedAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

/** Live stream of all applications an employer has received. */
export function subscribeEmployerApplications(
  employerUID: string,
  cb: (apps: ShiftApplication[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedCollection<ShiftApplication>(COL.shiftApplications),
    where('employerUID', '==', employerUID),
    orderBy('submittedAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

export async function withdrawApplication(id: string): Promise<void> {
  await updateDoc(typedDoc<ShiftApplication>(COL.shiftApplications, id), {
    status: 'withdrawn',
  })
}

export async function markApplicationViewed(app: ShiftApplication): Promise<void> {
  if (app.status !== 'submitted') return
  await updateDoc(typedDoc<ShiftApplication>(COL.shiftApplications, app.id), {
    status: 'viewed',
  })
}

/** Employer accepts/declines an application. Accepting fills the shift. */
export async function respondToApplication(
  app: ShiftApplication,
  decision: 'accepted' | 'declined',
  actor: { uid: string; name: string },
): Promise<void> {
  await updateDoc(typedDoc<ShiftApplication>(COL.shiftApplications, app.id), {
    status: decision,
    respondedAt: serverTimestamp(),
  })
  if (decision === 'accepted') await setShiftStatus(app.shiftID, 'filled')
  await createNotification({
    recipientUID: app.seekerUID,
    actorUID: actor.uid,
    actorName: actor.name,
    kind: decision === 'accepted' ? 'applicationAccepted' : 'applicationDeclined',
    message:
      decision === 'accepted'
        ? `Your application to “${app.shiftTitle}” was accepted`
        : `Your application to “${app.shiftTitle}” was declined`,
    targetID: app.shiftID,
  })
}

/** Mark an accepted shift completed with hours worked. */
export async function completeApplication(
  id: string,
  hoursWorked: number,
): Promise<void> {
  await updateDoc(typedDoc<ShiftApplication>(COL.shiftApplications, id), {
    status: 'completed',
    completedAt: serverTimestamp(),
    hoursWorked,
  })
}
