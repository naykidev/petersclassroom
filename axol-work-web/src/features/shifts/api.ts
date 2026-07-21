import {
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore'
import { COL, createDoc, typedCollection, typedDoc } from '@/lib/firestore'
import type { Shift, ShiftStatus } from '@/models'

export interface ShiftInput {
  title: string
  description: string
  address: string
  city: string
  payRate: string
  startTime: Date
  endTime: Date
  accommodationTags: string[]
}

/** Live stream of all open shifts (newest start first). */
export function subscribeOpenShifts(
  cb: (shifts: Shift[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedCollection<Shift>(COL.shifts),
    where('status', '==', 'open'),
    orderBy('startTime', 'asc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

/** Live stream of one employer's own shifts. */
export function subscribeEmployerShifts(
  employerUID: string,
  cb: (shifts: Shift[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedCollection<Shift>(COL.shifts),
    where('employerUID', '==', employerUID),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

export async function createShift(
  employer: { uid: string; name: string },
  input: ShiftInput,
): Promise<string> {
  return createDoc<Shift>(COL.shifts, {
    employerUID: employer.uid,
    employerName: employer.name,
    title: input.title,
    description: input.description,
    address: input.address,
    city: input.city,
    payRate: input.payRate,
    startTime: Timestamp.fromDate(input.startTime),
    endTime: Timestamp.fromDate(input.endTime),
    accommodationTags: input.accommodationTags,
    status: 'open',
  })
}

export async function updateShift(id: string, input: ShiftInput): Promise<void> {
  await updateDoc(typedDoc<Shift>(COL.shifts, id), {
    title: input.title,
    description: input.description,
    address: input.address,
    city: input.city,
    payRate: input.payRate,
    startTime: Timestamp.fromDate(input.startTime),
    endTime: Timestamp.fromDate(input.endTime),
    accommodationTags: input.accommodationTags,
  })
}

export async function setShiftStatus(id: string, status: ShiftStatus): Promise<void> {
  await updateDoc(typedDoc<Shift>(COL.shifts, id), { status })
}

/**
 * Accommodation fit: how many of the seeker's needs this shift's tags cover.
 * `total` is the seeker's need count (the denominator). Callers hide the badge
 * entirely when total === 0 (never "0 of 0").
 */
export function accommodationFit(
  seekerNeeds: string[],
  shiftTags: string[],
): { matched: number; total: number } {
  const tags = new Set(shiftTags)
  const matched = seekerNeeds.filter((n) => tags.has(n)).length
  return { matched, total: seekerNeeds.length }
}
