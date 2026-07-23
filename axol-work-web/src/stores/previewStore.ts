import { create } from 'zustand'
import type { AppUser, UserRole } from '@/models'
import { ACCOMMODATION_NEEDS, WORK_HISTORY_TAGS } from '@/models'
import { GUEST_UID } from '@/data/demoFixtures'

export { GUEST_UID }

export function makeDemoUser(role: Exclude<UserRole, 'unassigned'>): AppUser {
  if (role === 'employer') {
    return {
      uid: GUEST_UID,
      displayName: 'Guest Recruiter',
      role: 'employer',
      headline: 'Inclusive hiring team',
      workHistoryTags: [],
      connectionCount: 2,
      isVerifiedEmployed: false,
      verifiedEmployerUIDs: [],
      selectedCity: 'San Francisco',
      accommodationTags: [],
      accommodationNeeds: [],
      blockedUIDs: [],
      hasCompletedEmployerProfile: true,
      employerProfile: {
        companyName: 'Axol Work Company',
        workplaceAddress: '123 Market St, San Francisco',
        allowsNoiseCancelingHeadphones: true,
        offersSeatedWorkstations: true,
        offersStructuredNonverbalTraining: true,
      },
    }
  }

  return {
    uid: GUEST_UID,
    displayName: 'Guest Prospect',
    role: 'seeker',
    headline: 'Looking for accessible shift work',
    workHistoryTags: [WORK_HISTORY_TAGS[2]!, WORK_HISTORY_TAGS[0]!],
    connectionCount: 2,
    isVerifiedEmployed: true,
    verifiedEmployerUIDs: ['demo-employer-harbor'],
    selectedCity: 'San Francisco',
    accommodationTags: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[4]!],
    accommodationNeeds: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[4]!],
    accommodationVisibility: 'private',
    blockedUIDs: [],
    hasCompletedSeekerProfile: true,
    seekerOnboarding: {
      stepIndex: 6,
      selectedWorkTags: [WORK_HISTORY_TAGS[2]!, WORK_HISTORY_TAGS[0]!],
      selectedCity: 'San Francisco',
      selectedAvailability: ['Mornings', 'Afternoons'],
      selectedConstraints: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[4]!],
      otherNotes: '',
      accommodationVisibility: 'private',
    },
  }
}

export function isGuestUid(uid: string | undefined | null): boolean {
  return uid === GUEST_UID
}

interface PreviewState {
  active: boolean
  role: Exclude<UserRole, 'unassigned'>
  signupOpen: boolean
  signupReason: string

  enter: (role?: Exclude<UserRole, 'unassigned'>) => void
  exit: () => void
  setRole: (role: Exclude<UserRole, 'unassigned'>) => void
  /** Returns true if the caller should abort (guest blocked). */
  requireAccount: (reason?: string) => boolean
  closeSignup: () => void
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  active: false,
  role: 'seeker',
  signupOpen: false,
  signupReason: '',

  // Preserve the current role when enter() is called without one (e.g. auth init).
  enter: (role) =>
    set((s) => ({
      active: true,
      role: role ?? s.role,
      signupOpen: false,
      signupReason: '',
    })),
  exit: () => set({ active: false, signupOpen: false, signupReason: '' }),
  setRole: (role) => set({ role }),
  requireAccount: (reason = 'Create a free account to continue.') => {
    if (!get().active) return false
    set({ signupOpen: true, signupReason: reason })
    return true
  },
  closeSignup: () => set({ signupOpen: false, signupReason: '' }),
}))

/** True when the path is the public demo/preview entry (`/demo`). */
export function pathIsDemo(pathname: string): boolean {
  return pathname === '/demo' || pathname.startsWith('/demo/')
}

/** @deprecated Use pathIsDemo — kept for older /work/explore bookmarks. */
export function pathIsExplore(pathname: string): boolean {
  return (
    pathIsDemo(pathname) ||
    pathname === '/explore' ||
    pathname.endsWith('/explore') ||
    pathname.includes('/explore/')
  )
}
