import type { Timestamp } from 'firebase/firestore'
import type { ApplicationStatus, ShiftStatus } from './enums'

/** shifts/{id} */
export interface Shift {
  id: string
  employerUID: string
  employerName: string
  title: string
  description: string
  address: string
  city: string
  payRate: string
  startTime: Timestamp
  endTime: Timestamp
  accommodationTags: string[]
  status: ShiftStatus
}

/** shiftApplications/{id} */
export interface ShiftApplication {
  id: string
  shiftID: string
  shiftTitle: string
  employerUID: string
  employerName: string
  seekerUID: string
  seekerName: string
  status: ApplicationStatus
  submittedAt: Timestamp
  respondedAt?: Timestamp | null
  completedAt?: Timestamp | null
  hoursWorked?: number | null
}
