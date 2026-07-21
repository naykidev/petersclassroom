import {
  deleteField,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  COL,
  createSubDoc,
  pairId,
  typedDoc,
  typedSubcollection,
} from '@/lib/firestore'
import type { Conversation, Message } from '@/models'
import { createNotification } from '@/features/notifications/api'

/**
 * Get (or lazily create) the 1:1 conversation between two users. Id is the
 * deterministic sorted pair id, matching iOS.
 */
export async function getOrCreateConversation(
  me: { uid: string; name: string },
  other: { uid: string; name: string },
): Promise<string> {
  const id = pairId(me.uid, other.uid)
  const ref = typedDoc<Conversation>(COL.conversations, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(doc(db, COL.conversations, id), {
      participantUIDs: [me.uid, other.uid],
      participantNames: { [me.uid]: me.name, [other.uid]: other.name },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastSenderUID: '',
      lastReadAt: {},
    })
  }
  return id
}

/** Live message stream for a conversation, oldest first. */
export function subscribeMessages(
  conversationId: string,
  cb: (messages: Message[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    typedSubcollection<Message>(COL.conversations, conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

/** Send a message and update the conversation summary. */
export async function sendMessage(
  conversationId: string,
  sender: { uid: string; name: string },
  recipientUID: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  await createSubDoc<Message>(COL.conversations, conversationId, 'messages', {
    senderUID: sender.uid,
    senderName: sender.name,
    text: trimmed,
    createdAt: serverTimestamp(),
    reactions: {},
  })

  await updateDoc(typedDoc<Conversation>(COL.conversations, conversationId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
    lastSenderUID: sender.uid,
    [`lastReadAt.${sender.uid}`]: serverTimestamp(),
  })

  await createNotification({
    recipientUID,
    actorUID: sender.uid,
    actorName: sender.name,
    kind: 'message',
    message: `${sender.name} sent you a message`,
    targetID: conversationId,
  })
}

/** Mark a conversation read for a user (updates lastReadAt[uid]). */
export async function markConversationRead(
  conversationId: string,
  uid: string,
): Promise<void> {
  await updateDoc(typedDoc<Conversation>(COL.conversations, conversationId), {
    [`lastReadAt.${uid}`]: serverTimestamp(),
  })
}

/** Toggle an emoji reaction on a message (same emoji removes it). */
export async function toggleReaction(
  conversationId: string,
  messageId: string,
  uid: string,
  emoji: string,
  current: string | undefined,
): Promise<void> {
  const ref = doc(db, COL.conversations, conversationId, 'messages', messageId)
  await updateDoc(ref, {
    [`reactions.${uid}`]: current === emoji ? deleteField() : emoji,
  })
}
