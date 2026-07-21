import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  COL,
  createDoc,
  createSubDoc,
  typedCollection,
  typedDoc,
  typedSubcollection,
} from '@/lib/firestore'
import type { Comment, Post, PostVisibility } from '@/models'
import { createNotification } from '@/features/notifications/api'

/** Live post stream. `groupID` null = general community feed; set = group feed. */
export function subscribePosts(
  groupID: string | null,
  cb: (posts: Post[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const col = typedCollection<Post>(COL.posts)
  const q = query(
    col,
    where('groupID', '==', groupID),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data())),
    (e) => onError?.(e),
  )
}

export async function createPost(
  author: { uid: string; name: string },
  text: string,
  visibility: PostVisibility,
  groupID: string | null = null,
): Promise<string> {
  return createDoc<Post>(COL.posts, {
    authorUID: author.uid,
    authorName: author.name,
    text: text.trim(),
    createdAt: serverTimestamp(),
    visibility,
    likeCount: 0,
    commentCount: 0,
    groupID,
  })
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.posts, id))
}

// ── Likes (posts/{id}/likes/{uid}) ────────────────────────────────────────
export function subscribeMyLike(
  postID: string,
  uid: string,
  cb: (liked: boolean) => void,
): () => void {
  return onSnapshot(doc(db, COL.posts, postID, 'likes', uid), (snap) =>
    cb(snap.exists()),
  )
}

export async function toggleLike(postID: string, uid: string): Promise<void> {
  const likeRef = doc(db, COL.posts, postID, 'likes', uid)
  const postRef = typedDoc<Post>(COL.posts, postID)
  const snap = await getDoc(likeRef)
  if (snap.exists()) {
    await deleteDoc(likeRef)
    await updateDoc(postRef, { likeCount: increment(-1) })
  } else {
    await setDoc(likeRef, { uid, createdAt: serverTimestamp() })
    await updateDoc(postRef, { likeCount: increment(1) })
  }
}

// ── Comments (posts/{id}/comments) ────────────────────────────────────────
export function subscribeComments(
  postID: string,
  cb: (comments: Comment[]) => void,
): () => void {
  const q = query(
    typedSubcollection<Comment>(COL.posts, postID, 'comments'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}

export async function addComment(
  post: Post,
  author: { uid: string; name: string },
  text: string,
): Promise<void> {
  await createSubDoc<Comment>(COL.posts, post.id, 'comments', {
    postID: post.id,
    authorUID: author.uid,
    authorName: author.name,
    text: text.trim(),
    createdAt: serverTimestamp(),
  })
  await updateDoc(typedDoc<Post>(COL.posts, post.id), {
    commentCount: increment(1),
  })
  await createNotification({
    recipientUID: post.authorUID,
    actorUID: author.uid,
    actorName: author.name,
    kind: 'postComment',
    message: `${author.name} commented on your post`,
    targetID: post.id,
  })
}
