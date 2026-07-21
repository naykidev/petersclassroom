import { create } from 'zustand'
import {
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { COL, typedCollection } from '@/lib/firestore'
import type { AppNotification, ConnectionRequest, Conversation } from '@/models'

/**
 * Cross-cutting live social data — the Web port of the parts of iOS
 * `SocialService` that stay resident: the current user's notifications and
 * conversations (both real-time). Feature-specific reads/writes live in each
 * feature's `api.ts`.
 */

interface SocialState {
  notifications: AppNotification[]
  conversations: Conversation[]
  /** Accepted-connection records touching the current user. */
  connections: ConnectionRequest[]
  ready: boolean

  subscribe: (uid: string) => void
  unsubscribe: () => void
  unreadNotificationCount: () => number
  unreadConversationCount: (uid: string) => number
  /** Set of uids the current user is connected to (accepted only). */
  connectedUIDs: (uid: string) => Set<string>
}

let unsubs: Unsubscribe[] = []

export const useSocialStore = create<SocialState>((set, get) => ({
  notifications: [],
  conversations: [],
  connections: [],
  ready: false,

  subscribe: (uid) => {
    get().unsubscribe()

    const notifQ = query(
      typedCollection<AppNotification>(COL.notifications),
      where('recipientUID', '==', uid),
      orderBy('createdAt', 'desc'),
    )
    const convQ = query(
      typedCollection<Conversation>(COL.conversations),
      where('participantUIDs', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc'),
    )

    // Connections require two single-field queries (either side), merged.
    const connCol = typedCollection<ConnectionRequest>(COL.connectionRequests)
    const byA = new Map<string, ConnectionRequest>()
    const byB = new Map<string, ConnectionRequest>()
    const emitConns = () =>
      set({ connections: [...new Map([...byA, ...byB]).values()] })

    unsubs.push(
      onSnapshot(notifQ, (snap) =>
        set({ notifications: snap.docs.map((d) => d.data()) }),
      ),
      onSnapshot(convQ, (snap) =>
        set({ conversations: snap.docs.map((d) => d.data()), ready: true }),
      ),
      onSnapshot(query(connCol, where('fromUID', '==', uid)), (snap) => {
        byA.clear()
        snap.docs.forEach((d) => byA.set(d.id, d.data()))
        emitConns()
      }),
      onSnapshot(query(connCol, where('toUID', '==', uid)), (snap) => {
        byB.clear()
        snap.docs.forEach((d) => byB.set(d.id, d.data()))
        emitConns()
      }),
    )
  },

  unsubscribe: () => {
    unsubs.forEach((u) => u())
    unsubs = []
    set({ notifications: [], conversations: [], connections: [], ready: false })
  },

  unreadNotificationCount: () => get().notifications.filter((n) => !n.isRead).length,

  unreadConversationCount: (uid) =>
    get().conversations.filter((c) => {
      const read = c.lastReadAt?.[uid]
      if (c.lastSenderUID === uid) return false
      if (!c.lastMessageAt) return false
      if (!read) return true
      return c.lastMessageAt.toMillis() > read.toMillis()
    }).length,

  connectedUIDs: (uid) => {
    const set2 = new Set<string>()
    get().connections
      .filter((c) => c.status === 'accepted')
      .forEach((c) => set2.add(c.fromUID === uid ? c.toUID : c.fromUID))
    return set2
  },
}))
