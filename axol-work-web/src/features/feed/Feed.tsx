import { useEffect, useMemo, useState } from 'react'
import { MessageSquareText, Globe, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import type { Post, PostVisibility } from '@/models'
import { Avatar, Button, EmptyState, Spinner } from '@/components/ui'
import { cn } from '@/utils/cn'
import { createPost, subscribePosts } from './api'
import { PostCard } from './PostCard'
import { usePreviewStore } from '@/stores/previewStore'

/**
 * Shared feed. `groupID` null renders the general Community feed (with
 * visibility filtering); a set id renders that group's scoped discussion.
 */
export function Feed({
  groupID = null,
  canPost = true,
}: {
  groupID?: string | null
  canPost?: boolean
}) {
  const { user } = useAuthStore()
  const me = user!
  const { connectedUIDs } = useSocialStore()
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => subscribePosts(groupID, setPosts), [groupID])

  const connected = connectedUIDs(me.uid)
  const blocked = new Set(me.blockedUIDs ?? [])

  const visible = useMemo(() => {
    if (!posts) return []
    return posts.filter((p) => {
      if (blocked.has(p.authorUID)) return false
      if (groupID) return true // group posts visible to members viewing the group
      if (p.authorUID === me.uid) return true
      if (p.visibility === 'everyone') return true
      return connected.has(p.authorUID)
    })
  }, [posts, groupID, me.uid, connected, blocked])

  return (
    <div className="mx-auto max-w-2xl">
      {canPost && <Composer me={{ uid: me.uid, name: me.displayName }} groupID={groupID} />}
      <div className={cn('flex flex-col gap-4', canPost && 'mt-6')}>
        {!posts ? (
          <Spinner label="Loading posts" />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="No posts yet"
            message="Be the first to share something."
          />
        ) : (
          visible.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  )
}

function Composer({
  me,
  groupID,
}: {
  me: { uid: string; name: string }
  groupID: string | null
}) {
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState<PostVisibility>('everyone')
  const [posting, setPosting] = useState(false)

  async function submit() {
    if (!text.trim() || posting) return
    if (usePreviewStore.getState().requireAccount('Create a free account to post.')) return
    setPosting(true)
    try {
      await createPost(me, text, visibility, groupID)
      setText('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <Avatar name={me.name} />
        <div className="flex-1">
          <label htmlFor="composer" className="sr-only">
            Write a post
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Share something with the community…"
            className="w-full resize-y rounded-btn border border-border bg-page px-3 py-2 text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <div className="mt-3 flex items-center justify-between">
            {!groupID ? (
              <div className="flex gap-1" role="group" aria-label="Post visibility">
                {(['everyone', 'connections'] as PostVisibility[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    aria-pressed={visibility === v}
                    className={cn(
                      'flex items-center gap-1.5 rounded-chip px-3 py-1.5 text-sm font-medium',
                      visibility === v ? 'bg-brand-tint text-brand' : 'text-fg-muted hover:bg-muted',
                    )}
                  >
                    {v === 'everyone' ? <Globe className="h-4 w-4" aria-hidden /> : <Users className="h-4 w-4" aria-hidden />}
                    {v === 'everyone' ? 'Everyone' : 'Network'}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-caption text-fg-muted">Posting to this group</span>
            )}
            <Button onClick={submit} loading={posting} disabled={!text.trim()}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
