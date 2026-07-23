import { create } from 'zustand'
import type { AppUser, UserRole } from '@/models'
import { ACCOMMODATION_NEEDS, WORK_HISTORY_TAGS } from '@/models'

const GUEST_UID = 'guest-preview'

export function makeDemoUser(role: Exclude<UserRole, 'unassigned'>): AppUser {
  if (role === 'employer') {
    return {
      uid: GUEST_UID,
      displayName: 'Guest Recruiter',
      role: 'employer',
      headline: 'Inclusive hiring team',
      workHistoryTags: [],
      connectionCount: 0,
      isVerifiedEmployed: false,
      verifiedEmployerUIDs: [],
      selectedCity: 'San Francisco',
      accommodationTags: [],
      accommodationNeeds: [],
      blockedUIDs: [],
      hasCompletedEmployerProfile: true,
      employerProfile: {
        companyName: 'Demo Axol Work Company',
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
    connectionCount: 0,
    isVerifiedEmployed: false,
    verifiedEmployerUIDs: [],
    selectedCity: 'San Francisco',
    accommodationTags: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[4]!],
    accommodationNeeds: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[4]!],
    blockedUIDs: [],
    hasCompletedSeekerProfile: true,
    seekerOnboarding: {
      stepIndex: 5,
      selectedWorkTags: [WORK_HISTORY_TAGS[2]!, WORK_HISTORY_TAGS[0]!],
      selectedCity: 'San Francisco',
      selectedAvailability: ['Mornings', 'Afternoons'],
      selectedConstraints: [ACCOMMODATION_NEEDS[3]!, ACCOMMODATION_NEEDS[1]!, ACCOMMODATION_NEEDS[4]!],
      otherNotes: '',
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

  enter: (role = 'seeker') => set({ active: true, role, signupOpen: false, signupReason: '' }),
  exit: () => set({ active: false, signupOpen: false, signupReason: '' }),
  setRole: (role) => set({ role }),
  requireAccount: (reason = 'Create a free account to continue.') => {
    if (!get().active) return false
    set({ signupOpen: true, signupReason: reason })
    return true
  },
  closeSignup: () => set({ signupOpen: false, signupReason: '' }),
}))

/** True when the path is the public explore/preview entry. */
export function pathIsExplore(pathname: string): boolean {
  // basename is /work, so inside the router pathname is /explore
  // Outside the router (window), full path is /work/explore
  return (
    pathname === '/explore' ||
    pathname.endsWith('/explore') ||
    pathname.includes('/explore/')
  )
}
