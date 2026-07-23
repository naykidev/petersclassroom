import type { AppUser, EmployerProfile } from '@/models'

/** Count of workplace supports an employer has enabled. */
export function accommodationSupportCount(profile: EmployerProfile | undefined | null): number {
  if (!profile) return 0
  return [
    profile.allowsNoiseCancelingHeadphones,
    profile.offersSeatedWorkstations,
    profile.offersStructuredNonverbalTraining,
  ].filter(Boolean).length
}

/**
 * Inclusive hiring employers: opted in to hire disabled / neurodivergent workers
 * AND offer at least one workplace accommodation.
 */
export function isInclusiveHiringEmployer(
  user: Pick<AppUser, 'role' | 'employerProfile'> | null | undefined,
): boolean {
  if (!user || user.role !== 'employer') return false
  const p = user.employerProfile
  if (!p?.inclusiveHiringCommitted) return false
  return accommodationSupportCount(p) >= 1
}
