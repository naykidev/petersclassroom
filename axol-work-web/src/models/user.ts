import type { UserRole } from './enums'

/**
 * users/{uid} — user doc: role + public profile + onboarding drafts.
 * Field names are the on-disk contract shared with iOS.
 */

/**
 * Whether a Prospect’s accommodation needs appear on their public profile.
 * Fit matching still uses private needs for the logged-in Prospect either way.
 * Default for new accounts is `private`.
 */
export type AccommodationVisibility = 'private' | 'shared'

/** Seeker onboarding draft (persisted between steps). */
export interface SeekerOnboardingDraft {
  stepIndex: number
  selectedWorkTags: string[]
  selectedCity: string
  selectedAvailability: string[]
  selectedConstraints: string[]
  otherNotes: string
  accommodationVisibility?: AccommodationVisibility
}

/** Employer profile config. */
export interface EmployerProfile {
  companyName: string
  workplaceAddress: string
  allowsNoiseCancelingHeadphones: boolean
  offersSeatedWorkstations: boolean
  offersStructuredNonverbalTraining: boolean
  /**
   * Recruiter opts in: we want to hire disabled and neurodivergent workers,
   * not only list accommodations. Used for Inclusive hiring badge / showcase.
   */
  inclusiveHiringCommitted?: boolean
}

export interface AppUser {
  uid: string
  displayName: string
  /**
   * Email is PII and is NOT stored on the world-readable profile doc (the
   * Firestore rules reject any write containing `email`). It lives in Firebase
   * Auth only; for the current user it's populated in-memory from the auth
   * session. Undefined for other users.
   */
  email?: string
  role: UserRole

  // Public profile
  headline: string
  workHistoryTags: string[]
  connectionCount: number
  isVerifiedEmployed: boolean
  verifiedEmployerUIDs: string[]
  selectedCity: string
  accommodationTags: string[]
  accommodationNeeds: string[]
  /**
   * Prospect-only. When `private` (default), accommodation needs stay off the
   * public profile and are redacted for other viewers in the app.
   */
  accommodationVisibility?: AccommodationVisibility
  blockedUIDs: string[]

  // Onboarding / role-specific (optional; present once the flow runs)
  seekerOnboarding?: SeekerOnboardingDraft
  employerProfile?: EmployerProfile

  // Completion flags used by the route resolver
  hasCompletedSeekerProfile?: boolean
  hasCompletedEmployerProfile?: boolean
}

/** Fields safe to expose on a public profile view. */
export type PublicProfile = Pick<
  AppUser,
  | 'uid'
  | 'displayName'
  | 'role'
  | 'headline'
  | 'workHistoryTags'
  | 'connectionCount'
  | 'isVerifiedEmployed'
  | 'selectedCity'
  | 'accommodationTags'
  | 'accommodationNeeds'
  | 'accommodationVisibility'
>
