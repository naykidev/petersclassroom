import type { UserRole } from '@/models'

/** User-facing role nouns. Stored values remain seeker / employer. */
export function roleLabel(role: UserRole): string {
  if (role === 'seeker') return 'Prospect'
  if (role === 'employer') return 'Recruiter'
  return 'Member'
}
