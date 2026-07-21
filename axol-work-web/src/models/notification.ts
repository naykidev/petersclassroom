import type { Timestamp } from 'firebase/firestore'
import type { NotificationKind } from './enums'

/** notifications/{id} */
export interface AppNotification {
  id: string
  recipientUID: string
  actorUID: string
  actorName: string
  kind: NotificationKind
  message: string
  targetID?: string | null
  isRead: boolean
  createdAt: Timestamp
}
