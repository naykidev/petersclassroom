import type { UserRole } from './enums'

/**
 * users/{uid} — user doc: role + public profile + onboarding drafts.
 * Field names are the on-disk contract shared with iOS.
 */

/** Seeker onboarding draft (persisted between steps). */
export interface SeekerOnboardingDraft {
  stepIndex: number
  selectedWorkTags: string[]
  selectedCity: string
  selectedAvailability: string[]
  selectedConstraints: string[]
  otherNotes: string
}

/** Employer profile config. */
export interface EmployerProfile {
  companyName: string
  workplaceAddress: string
  allowsNoiseCancelingHeadphones: boolean
  offersSeatedWorkstations: boolean
  offersStructuredNonverbalTraining: boolean
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
>
