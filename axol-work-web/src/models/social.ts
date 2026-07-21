import type { Timestamp } from 'firebase/firestore'
import type { ConnectionStatus, PostVisibility } from './enums'

/**
 * connectionRequests/{id}
 * Deterministic id = sorted [uidA, uidB].join("_").
 * `fromUID` is the requester, `toUID` the recipient (per the deployed rules).
 */
export interface ConnectionRequest {
  id: string
  fromUID: string
  toUID: string
  otherUserName?: string
  status: ConnectionStatus
}

/**
 * conversations/{id}
 * id = sorted [uidA, uidB].join("_").
 */
export interface Conversation {
  id: string
  participantUIDs: string[]
  participantNames: Record<string, string>
  lastMessage: string
  lastMessageAt: Timestamp
  lastSenderUID: string
  lastReadAt: Record<string, Timestamp>
}

/** conversations/{id}/messages/{msgId} */
export interface Message {
  id: string
  senderUID: string
  senderName: string
  text: string
  createdAt: Timestamp
  reactions: Record<string, string> // uid -> emoji
}

/**
 * posts/{id}
 * groupID null/undefined = general Community feed; set = group discussion.
 */
export interface Post {
  id: string
  authorUID: string
  authorName: string
  text: string
  createdAt: Timestamp
  visibility: PostVisibility
  likeCount: number
  commentCount: number
  groupID?: string | null
}

/** posts/{id}/comments/{id} */
export interface Comment {
  id: string
  postID: string
  authorUID: string
  authorName: string
  text: string
  createdAt: Timestamp
}

/** posts/{id}/likes/{uid} */
export interface Like {
  id: string // = uid
  uid: string
  createdAt: Timestamp
}

/** communityGroups/{id} */
export interface CommunityGroup {
  id: string
  name: string
  groupDescription: string
  creatorUID: string
  creatorName: string
  memberUIDs: string[]
  memberCount: number
  createdAt: Timestamp
}
