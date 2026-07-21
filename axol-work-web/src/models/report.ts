import type { Timestamp } from 'firebase/firestore'
import type { ReportStatus, ReportTargetType } from './enums'

/** reports/{id} */
export interface Report {
  id: string
  reporterUID: string
  targetType: ReportTargetType
  targetID: string
  reason: string
  createdAt: Timestamp
  status: ReportStatus
}
