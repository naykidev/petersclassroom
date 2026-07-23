import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, MoreHorizontal, Flag, Trash2, Globe, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { usePreviewStore } from '@/stores/previewStore'
import type { Comment, Post } from '@/models'
import { Avatar, Button } from '@/components/ui'
import { ReportModal } from '@/components/ReportModal'
import { relativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import { addComment, deletePost, subscribeComments, subscribeMyLike, toggleLike } from './api'

export function PostCard({ post }: { post: Post }) {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [commentText, setCommentText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const isOwn = post.authorUID === me.uid

  useEffect(() => {
    if (isGuest) {
      setLiked(false)
      return
    }
    return subscribeMyLike(post.id, me.uid, setLiked)
  }, [post.id, me.uid, isGuest])
  useEffect(() => {
    if (showComments) return subscribeComments(post.id, setComments)
  }, [showComments, post.id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    if (usePreviewStore.getState().requireAccount('Create a free account to comment.')) return
    const body = commentText
    setCommentText('')
    await addComment(post, { uid: me.uid, name: me.displayName }, body)
  }

  return (
    <article className="rounded-card border border-border bg-card p-4 shadow-card">
      <header className="flex items-start justify-between gap-2">
        <button className="flex items-center gap-3 text-left" onClick={() => navigate(`/u/${post.authorUID}`)}>
          <Avatar name={post.authorName} />
          <div>
            <p className="font-semibold text-fg hover:underline">{post.authorName}</p>
            <p className="flex items-center gap-1 text-caption text-fg-muted">
              {relativeTime(post.createdAt)} ago ·{' '}
              {post.visibility === 'everyone' ? (
                <><Globe className="h-3 w-3" aria-hidden /> Everyone</>
              ) : (
                <><Users className="h-3 w-3" aria-hidden /> Network</>
              )}
            </p>
          </div>
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Post options"
            className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-muted"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-btn border border-border bg-card shadow-elevated"
              onMouseLeave={() => setMenuOpen(false)}
            >
              {isOwn ? (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    if (usePreviewStore.getState().requireAccount('Create a free account to manage posts.')) return
                    deletePost(post.id)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    if (usePreviewStore.getState().requireAccount('Create a free account to report content.')) return
                    setReportOpen(true)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-muted"
                >
                  <Flag className="h-4 w-4" aria-hidden /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <p className="mt-3 whitespace-pre-wrap text-fg">{post.text}</p>

      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
        <button
          onClick={() => {
            if (usePreviewStore.getState().requireAccount('Create a free account to like posts.')) return
            toggleLike(post.id, me.uid)
          }}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            liked ? 'text-brand' : 'text-fg-muted hover:text-fg',
          )}
        >
          <Heart className={cn('h-5 w-5', liked && 'fill-current')} aria-hidden />
          {post.likeCount}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
          aria-expanded={showComments}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {post.commentCount}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 flex flex-col gap-3">
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar name={c.authorName} size="sm" />
              <div className="rounded-card bg-muted px-3 py-2">
                <p className="text-sm font-semibold text-fg">{c.authorName}</p>
                <p className="text-sm text-fg">{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex gap-2">
            <label htmlFor={`c-${post.id}`} className="sr-only">
              Add a comment
            </label>
            <input
              id={`c-${post.id}`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="min-h-touch flex-1 rounded-btn border border-border bg-page px-3 text-sm text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <Button type="submit" size="sm" disabled={!commentText.trim()}>
              Post
            </Button>
          </form>
        </div>
      )}

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="post" targetID={post.id} />
    </article>
  )
}
