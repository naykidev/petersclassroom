import {
  addDoc,
  collection,
  doc,
  setDoc,
  type CollectionReference,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser } from '@/models'

/**
 * Generic typed converter. Injects the Firestore doc id as `id` on read and
 * strips `id` on write (the id lives in the path, never in the document body).
 * Use this instead of casting `snapshot.data() as T` so no `any` leaks in.
 */
export function converter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      const { id: _omit, ...rest } = model
      void _omit
      return rest
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data()
      return { id: snapshot.id, ...data } as T
    },
  }
}

/** A typed top-level collection reference. */
export function typedCollection<T extends { id: string }>(
  path: string,
): CollectionReference<T> {
  return collection(db, path).withConverter(converter<T>())
}

/** A typed subcollection reference under a document. */
export function typedSubcollection<T extends { id: string }>(
  parentPath: string,
  parentId: string,
  subPath: string,
): CollectionReference<T> {
  return collection(db, parentPath, parentId, subPath).withConverter(
    converter<T>(),
  )
}

/**
 * Payload type for creating a document: everything except the synthetic `id`,
 * with `serverTimestamp()` allowed anywhere a Timestamp is expected.
 */
export type NewDoc<T extends { id: string }> = WithFieldValue<Omit<T, 'id'>>

/** Create a doc with an auto id in a top-level collection. Returns its id. */
export async function createDoc<T extends { id: string }>(
  path: string,
  data: NewDoc<T>,
): Promise<string> {
  const ref = await addDoc(collection(db, path), data as DocumentData)
  return ref.id
}

/** Create/overwrite a doc at a deterministic id. */
export async function setDocAt<T extends { id: string }>(
  path: string,
  id: string,
  data: NewDoc<T>,
  merge = false,
): Promise<void> {
  await setDoc(doc(db, path, id), data as DocumentData, { merge })
}

/** Create a doc with an auto id in a subcollection. Returns its id. */
export async function createSubDoc<T extends { id: string }>(
  parentPath: string,
  parentId: string,
  subPath: string,
  data: NewDoc<T>,
): Promise<string> {
  const ref = await addDoc(
    collection(db, parentPath, parentId, subPath),
    data as DocumentData,
  )
  return ref.id
}

// ── Deterministic id rules (must match iOS) ───────────────────────────────

/**
 * Deterministic pair id used by `conversations` and `connectionRequests`:
 * sorted [uidA, uidB].join("_"). Order-independent so both users resolve the
 * same document.
 */
export function pairId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_')
}

/**
 * Deterministic id for `employmentVerifications`:
 * "{employerUID}_{seekerUID}" (order matters — employer first).
 */
export function verificationId(employerUID: string, seekerUID: string): string {
  return `${employerUID}_${seekerUID}`
}

// ── Collection name constants ──────────────────────────────────────────────
export const COL = {
  users: 'users',
  shifts: 'shifts',
  shiftApplications: 'shiftApplications',
  connectionRequests: 'connectionRequests',
  conversations: 'conversations',
  posts: 'posts',
  communityGroups: 'communityGroups',
  employerReviews: 'employerReviews',
  workHistoryEntries: 'workHistoryEntries',
  employmentVerifications: 'employmentVerifications',
  notifications: 'notifications',
  reports: 'reports',
} as const

/** A typed document reference in a top-level collection. */
export function typedDoc<T extends { id: string }>(path: string, id: string) {
  return doc(db, path, id).withConverter(converter<T>())
}

/**
 * Users are keyed by `uid` (not `id`), and the doc body stores `uid` per the
 * iOS contract — so they get a dedicated converter that keeps `uid` in sync
 * with the document path.
 */
const userConverter: FirestoreDataConverter<AppUser> = {
  toFirestore(u) {
    // Never persist `email` (PII) or the synthetic `uid` field body — the
    // Firestore rules reject any users/{uid} write containing `email`.
    const { email: _email, ...rest } = u as AppUser
    void _email
    return rest as DocumentData
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): AppUser {
    return { ...(snapshot.data() as AppUser), uid: snapshot.id }
  },
}

/** A typed reference to a users/{uid} document. */
export function userDoc(uid: string) {
  return doc(db, COL.users, uid).withConverter(userConverter)
}

/** The typed users collection (for queries). */
export function usersCollection(): CollectionReference<AppUser> {
  return collection(db, COL.users).withConverter(userConverter)
}
