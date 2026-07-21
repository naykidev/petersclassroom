import type { Timestamp } from 'firebase/firestore'
import type { WorkHistoryStatus } from './enums'

/** employerReviews/{id} */
export interface EmployerReview {
  id: string
  employerUID: string
  reviewerUID: string
  reviewerName: string
  ratingTags: string[]
  optionalNote: string
  createdAt: Timestamp
}

/** workHistoryEntries/{id} — endDate null = currently employed. */
export interface WorkHistoryEntry {
  id: string
  seekerUID: string
  seekerName: string
  employerUID: string
  employerName: string
  jobTitle: string
  startDate: Timestamp
  endDate?: Timestamp | null
  status: WorkHistoryStatus
  requestedAt: Timestamp
  respondedAt?: Timestamp | null
}

/**
 * employmentVerifications/{id}
 * Deterministic id = "{employerUID}_{seekerUID}".
 */
export interface EmploymentVerification {
  id: string
  employerUID: string
  seekerUID: string
  createdAt?: Timestamp
}
