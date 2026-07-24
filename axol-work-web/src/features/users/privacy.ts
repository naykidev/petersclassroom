import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COL } from '@/lib/firestore'
import type { AccommodationVisibility, AppUser, SeekerOnboardingDraft } from '@/models'

/**
 * Owner-only sensitive Prospect data. Lives in `userPrivate/{uid}` so it is
 * never on the world-readable `users/{uid}` profile when visibility is private.
 * Deploy Firestore rules: allow read/write only when request.auth.uid == uid.
 */
export interface UserPrivateDoc {
  accommodationNeeds: string[]
  accommodationTags: string[]
  otherNotes: string
  selectedAvailability: string[]
}

export function userPrivateDocRef(uid: string) {
  return doc(db, COL.userPrivate, uid)
}

export async function loadUserPrivate(uid: string): Promise<UserPrivateDoc | null> {
  const snap = await getDoc(userPrivateDocRef(uid))
  if (!snap.exists()) return null
  const d = snap.data() as Partial<UserPrivateDoc>
  return {
    accommodationNeeds: d.accommodationNeeds ?? [],
    accommodationTags: d.accommodationTags ?? [],
    otherNotes: d.otherNotes ?? '',
    selectedAvailability: d.selectedAvailability ?? [],
  }
}

export async function saveUserPrivate(uid: string, data: UserPrivateDoc): Promise<void> {
  await setDoc(userPrivateDocRef(uid), data, { merge: true })
}

export async function deleteUserPrivate(uid: string): Promise<void> {
  try {
    await deleteDoc(userPrivateDocRef(uid))
  } catch {
    // Missing doc / rules — ignore on account delete.
  }
}

/** Strip accommodation PII from a profile for non-owners when visibility is private. */
export function redactAccommodationsForViewer(
  profile: AppUser,
  viewerUID: string | undefined | null,
): AppUser {
  if (profile.uid === viewerUID) return profile
  if (profile.role !== 'seeker') return profile
  const visibility = profile.accommodationVisibility ?? 'private'
  if (visibility === 'shared') {
    // Never leak onboarding draft notes even when needs are shared.
    return {
      ...profile,
      seekerOnboarding: profile.seekerOnboarding
        ? {
            ...profile.seekerOnboarding,
            otherNotes: '',
            selectedConstraints: profile.accommodationNeeds ?? [],
          }
        : undefined,
    }
  }
  return {
    ...profile,
    accommodationNeeds: [],
    accommodationTags: [],
    seekerOnboarding: profile.seekerOnboarding
      ? {
          ...profile.seekerOnboarding,
          otherNotes: '',
          selectedConstraints: [],
        }
      : undefined,
  }
}

/**
 * Merge owner-only private fields into the in-memory session user.
 * Public doc keeps empty needs when visibility is private.
 */
export function mergePrivateIntoUser(publicUser: AppUser, priv: UserPrivateDoc | null): AppUser {
  if (!priv) return publicUser
  const visibility = publicUser.accommodationVisibility ?? 'private'
  // Prefer private store as source of truth for needs when private;
  // when shared, public doc should already match — still fill gaps from private.
  const needs =
    priv.accommodationNeeds.length > 0
      ? priv.accommodationNeeds
      : publicUser.accommodationNeeds ?? []
  const tags =
    priv.accommodationTags.length > 0
      ? priv.accommodationTags
      : publicUser.accommodationTags ?? []
  const onboarding: SeekerOnboardingDraft | undefined = publicUser.seekerOnboarding
    ? {
        ...publicUser.seekerOnboarding,
        otherNotes: priv.otherNotes || publicUser.seekerOnboarding.otherNotes || '',
        selectedConstraints: needs,
        selectedAvailability:
          priv.selectedAvailability.length > 0
            ? priv.selectedAvailability
            : publicUser.seekerOnboarding.selectedAvailability,
        accommodationVisibility: visibility,
      }
    : undefined
  return {
    ...publicUser,
    accommodationNeeds: needs,
    accommodationTags: tags,
    seekerOnboarding: onboarding,
  }
}

type SensitiveKeys =
  | 'accommodationNeeds'
  | 'accommodationTags'
  | 'accommodationVisibility'
  | 'seekerOnboarding'

/**
 * Split a profile update into (1) owner-only private doc write and
 * (2) a sanitized public `users/{uid}` patch that never stores private needs.
 */
export async function splitAccommodationWrite(
  uid: string,
  current: AppUser | null,
  patch: Partial<AppUser>,
): Promise<Partial<AppUser>> {
  const touchesSensitive = (
    ['accommodationNeeds', 'accommodationTags', 'accommodationVisibility', 'seekerOnboarding'] as SensitiveKeys[]
  ).some((k) => k in patch)

  if (!touchesSensitive) {
    return patch
  }

  const visibility: AccommodationVisibility =
    patch.accommodationVisibility ??
    current?.accommodationVisibility ??
    'private'

  const existingPriv = await loadUserPrivate(uid)
  const needs =
    patch.accommodationNeeds ??
    existingPriv?.accommodationNeeds ??
    current?.accommodationNeeds ??
    []
  const tags =
    patch.accommodationTags ??
    existingPriv?.accommodationTags ??
    current?.accommodationTags ??
    needs
  const otherNotes =
    patch.seekerOnboarding?.otherNotes ??
    existingPriv?.otherNotes ??
    current?.seekerOnboarding?.otherNotes ??
    ''
  const selectedAvailability =
    patch.seekerOnboarding?.selectedAvailability ??
    existingPriv?.selectedAvailability ??
    current?.seekerOnboarding?.selectedAvailability ??
    []

  await saveUserPrivate(uid, {
    accommodationNeeds: needs,
    accommodationTags: tags,
    otherNotes,
    selectedAvailability,
  })

  const publicNeeds = visibility === 'shared' ? needs : []
  const publicTags = visibility === 'shared' ? tags : []

  const out: Partial<AppUser> = { ...patch }
  out.accommodationVisibility = visibility
  out.accommodationNeeds = publicNeeds
  out.accommodationTags = publicTags

  if (patch.seekerOnboarding || current?.seekerOnboarding) {
    const base = patch.seekerOnboarding ?? current?.seekerOnboarding
    if (base) {
      out.seekerOnboarding = {
        ...base,
        // Keep draft structure on public doc for onboarding resume, but never
        // persist free-text notes or constraint lists that mirror private needs.
        otherNotes: '',
        selectedConstraints: [],
        accommodationVisibility: visibility,
      }
    }
  }

  // Ensure we don't accidentally leave undefined sensitive keys unset when
  // only visibility changed — still clear public needs when flipping private.
  if (!('accommodationNeeds' in patch) && visibility === 'private') {
    out.accommodationNeeds = []
    out.accommodationTags = []
  }

  return out
}

/**
 * One-time migration: if the public profile still holds private needs, move
 * them into `userPrivate` and clear the public fields.
 */
export async function migratePrivateNeedsOffPublicProfile(
  uid: string,
  publicUser: AppUser,
): Promise<Partial<AppUser> | null> {
  const visibility = publicUser.accommodationVisibility ?? 'private'
  if (visibility !== 'private') return null

  const hasPublicNeeds =
    (publicUser.accommodationNeeds?.length ?? 0) > 0 ||
    (publicUser.accommodationTags?.length ?? 0) > 0 ||
    !!publicUser.seekerOnboarding?.otherNotes ||
    (publicUser.seekerOnboarding?.selectedConstraints?.length ?? 0) > 0

  if (!hasPublicNeeds) return null

  const existing = await loadUserPrivate(uid)
  await saveUserPrivate(uid, {
    accommodationNeeds:
      existing?.accommodationNeeds?.length
        ? existing.accommodationNeeds
        : publicUser.accommodationNeeds ?? [],
    accommodationTags:
      existing?.accommodationTags?.length
        ? existing.accommodationTags
        : publicUser.accommodationTags ?? publicUser.accommodationNeeds ?? [],
    otherNotes:
      existing?.otherNotes || publicUser.seekerOnboarding?.otherNotes || '',
    selectedAvailability:
      existing?.selectedAvailability?.length
        ? existing.selectedAvailability
        : publicUser.seekerOnboarding?.selectedAvailability ?? [],
  })

  return {
    accommodationNeeds: [],
    accommodationTags: [],
    seekerOnboarding: publicUser.seekerOnboarding
      ? {
          ...publicUser.seekerOnboarding,
          otherNotes: '',
          selectedConstraints: [],
        }
      : undefined,
  }
}
