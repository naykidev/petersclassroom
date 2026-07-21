import { serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COL, createDoc, typedDoc } from '@/lib/firestore'
import type { AppNotification, NotificationKind } from '@/models'

/** Create a notification for a recipient. No-op if actor == recipient. */
export async function createNotification(input: {
  recipientUID: string
  actorUID: string
  actorName: string
  kind: NotificationKind
  message: string
  targetID?: string | null
}): Promise<void> {
  if (input.recipientUID === input.actorUID) return
  await createDoc<AppNotification>(COL.notifications, {
    ...input,
    targetID: input.targetID ?? null,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(typedDoc<AppNotification>(COL.notifications, id), { isRead: true })
}

export async function markAllNotificationsRead(
  notifications: AppNotification[],
): Promise<void> {
  const unread = notifications.filter((n) => !n.isRead)
  if (!unread.length) return
  const batch = writeBatch(db)
  unread.forEach((n) =>
    batch.update(typedDoc<AppNotification>(COL.notifications, n.id), { isRead: true }),
  )
  await batch.commit()
}
