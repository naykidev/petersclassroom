/**
 * Enum raw values — the on-disk contract shared with the iOS app.
 * These string literals MUST match the iOS raw values exactly. Do not rename.
 */

export type UserRole = 'unassigned' | 'seeker' | 'employer'

export type ShiftStatus = 'open' | 'filled' | 'cancelled'

export type ApplicationStatus =
  | 'submitted'
  | 'withdrawn'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'completed'

export type ConnectionStatus = 'pending' | 'accepted'

export type PostVisibility = 'connections' | 'everyone'

export type WorkHistoryStatus = 'pending' | 'verified' | 'declined'

/**
 * Recruiter (employer) trust status. Only Axol staff can set `verified` or
 * `suspended` (Firestore rules). Self-service may move `unverified` → `pending`
 * when onboarding finishes. Only `verified` Recruiters may post shifts.
 */
export type EmployerVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'suspended'

export type NotificationKind =
  | 'connectionRequest'
  | 'connectionAccepted'
  | 'applicationAccepted'
  | 'applicationDeclined'
  | 'workHistoryVerified'
  | 'workHistoryDeclined'
  | 'postComment'
  | 'message'

export type ReportTargetType = 'post' | 'group' | 'user' | 'review' | 'comment'

export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed'

// Arrays of every raw value, for exhaustive UI rendering / validation.
export const USER_ROLES: UserRole[] = ['unassigned', 'seeker', 'employer']
export const SHIFT_STATUSES: ShiftStatus[] = ['open', 'filled', 'cancelled']
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'submitted',
  'withdrawn',
  'viewed',
  'accepted',
  'declined',
  'completed',
]
export const CONNECTION_STATUSES: ConnectionStatus[] = ['pending', 'accepted']
export const POST_VISIBILITIES: PostVisibility[] = ['connections', 'everyone']
export const WORK_HISTORY_STATUSES: WorkHistoryStatus[] = [
  'pending',
  'verified',
  'declined',
]
export const EMPLOYER_VERIFICATION_STATUSES: EmployerVerificationStatus[] = [
  'unverified',
  'pending',
  'verified',
  'suspended',
]
