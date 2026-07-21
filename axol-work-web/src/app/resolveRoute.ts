import type { AppUser } from '@/models'

/** Top-level app phases, resolved in priority order (mirrors iOS AppRouteResolver). */
export type AppPhase =
  | 'splash'
  | 'auth'
  | 'accountType'
  | 'seekerOnboarding'
  | 'employerOnboarding'
  | 'main'

/**
 * Resolve the landing phase from auth/user state, in this exact order:
 * 1. loading -> splash
 * 2. not logged in -> auth
 * 3. role unassigned -> account type selection
 * 4. seeker without completed profile -> seeker onboarding
 * 5. employer without completed profile -> employer onboarding
 * 6. otherwise -> main app
 */
export function resolvePhase(loading: boolean, user: AppUser | null): AppPhase {
  if (loading) return 'splash'
  if (!user) return 'auth'
  if (user.role === 'unassigned') return 'accountType'
  if (user.role === 'seeker' && !user.hasCompletedSeekerProfile)
    return 'seekerOnboarding'
  if (user.role === 'employer' && !user.hasCompletedEmployerProfile)
    return 'employerOnboarding'
  return 'main'
}
