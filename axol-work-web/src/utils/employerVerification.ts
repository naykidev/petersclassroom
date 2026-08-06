import type { AppUser } from '@/models'

/** True when this Recruiter is allowed to post shifts (Axol-verified). */
export function canPostShifts(user: AppUser | null | undefined): boolean {
  if (!user || user.role !== 'employer') return false
  return user.employerVerificationStatus === 'verified'
}

/** Human label for Recruiter verification status. */
export function employerVerificationLabel(
  status: AppUser['employerVerificationStatus'],
): string {
  switch (status) {
    case 'verified':
      return 'Verified Recruiter'
    case 'pending':
      return 'Verification pending'
    case 'suspended':
      return 'Posting suspended'
    case 'unverified':
    default:
      return 'Not verified'
  }
}
