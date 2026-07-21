import { onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { COL, setDocAt, typedCollection } from '@/lib/firestore'
import type { EmployerReview } from '@/models'

/** Live stream of reviews left for an employer (newest first). */
export function subscribeEmployerReviews(
  employerUID: string,
  cb: (reviews: EmployerReview[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedCollection<EmployerReview>(COL.employerReviews),
    where('employerUID', '==', employerUID),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

/**
 * A verified employee leaves a tag-based review for an employer. The doc id is
 * deterministic — `{employerUID}_{reviewerUID}` — so one review per pair
 * (rules enforce both the id and that the reviewer has an employment
 * verification with this employer). Note is capped at 280 chars.
 */
export async function createEmployerReview(input: {
  employerUID: string
  reviewer: { uid: string; name: string }
  ratingTags: string[]
  optionalNote: string
}): Promise<void> {
  const id = `${input.employerUID}_${input.reviewer.uid}`
  await setDocAt<EmployerReview>(COL.employerReviews, id, {
    employerUID: input.employerUID,
    reviewerUID: input.reviewer.uid,
    reviewerName: input.reviewer.name,
    ratingTags: input.ratingTags,
    optionalNote: input.optionalNote.slice(0, 280),
    createdAt: serverTimestamp(),
  })
}
