import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mail, Send, SmilePlus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import type { Conversation, Message } from '@/models'
import { Avatar, EmptyState, Spinner } from '@/components/ui'
import { messageTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import {
  markConversationRead,
  sendMessage,
  subscribeMessages,
  toggleReaction,
} from './api'
import { usePreviewStore } from '@/stores/previewStore'
import { DEMO_MESSAGES } from '@/data/demoFixtures'

const REACTIONS = ['👍', '❤️', '🎉', '😂', '🙏']

export function MessagesPage() {
  const { user } = useAuthStore()
  const { conversations, ready } = useSocialStore()
  const { conversationId } = useParams()
  const navigate = useNavigate()

  const active = conversations.find((c) => c.id === conversationId) ?? null

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <aside
        className={cn(
          'flex flex-col rounded-card border border-border bg-card overflow-hidden',
          conversationId && 'hidden md:flex',
        )}
      >
        <div className="border-b border-border p-4">
          <h1 className="text-headline text-fg">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!ready ? (
            <Spinner label="Loading conversations" />
          ) : conversations.length === 0 ? (
            <EmptyState icon={Mail} title="No conversations yet" message="Start one from someone’s profile." />
          ) : (
            <ul>
              {conversations.map((c) => (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  meUID={user!.uid}
                  active={c.id === conversationId}
                  onClick={() => navigate(`/messages/${c.id}`)}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Thread */}
      <section
        className={cn(
          'flex flex-col rounded-card border border-border bg-card overflow-hidden',
          !conversationId && 'hidden md:flex',
        )}
      >
        {active ? (
          <Thread conversation={active} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState icon={Mail} title="Select a conversation" message="Choose a chat to start messaging." />
          </div>
        )}
      </section>
    </div>
  )
}

function ConversationRow({
  conversation,
  meUID,
  active,
  onClick,
}: {
  conversation: Conversation
  meUID: string
  active: boolean
  onClick: () => void
}) {
  const otherUID = conversation.participantUIDs.find((u) => u !== meUID) ?? meUID
  const name = conversation.participantNames?.[otherUID] ?? 'Unknown'
  const read = conversation.lastReadAt?.[meUID]
  const unread =
    conversation.lastSenderUID !== meUID &&
    conversation.lastMessageAt &&
    (!read || conversation.lastMessageAt.toMillis() > read.toMillis())

  return (
    <li>
      <button
        onClick={onClick}
        aria-current={active}
        className={cn(
          'flex w-full items-center gap-3 border-b border-border p-3 text-left transition hover:bg-muted',
          active && 'bg-brand-tint',
        )}
      >
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-fg">{name}</span>
            <span className="shrink-0 text-caption text-fg-muted">
              {messageTime(conversation.lastMessageAt)}
            </span>
          </div>
          <p className={cn('truncate text-sm', unread ? 'font-semibold text-fg' : 'text-fg-muted')}>
            {conversation.lastMessage || 'No messages yet'}
          </p>
        </div>
        {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
      </button>
    </li>
  )
}

function Thread({ conversation }: { conversation: Conversation }) {
  const { user, isGuest } = useAuthStore()
  const me = user!
  const otherUID = conversation.participantUIDs.find((u) => u !== me.uid) ?? me.uid
  const otherName = conversation.participantNames?.[otherUID] ?? 'Unknown'

  const [messages, setMessages] = useState<Message[] | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isGuest) {
      setMessages(DEMO_MESSAGES[conversation.id] ?? [])
      return
    }
    setMessages(null)
    const unsub = subscribeMessages(conversation.id, setMessages)
    return unsub
  }, [conversation.id, isGuest])

  // Mark read whenever new messages arrive in the open thread.
  useEffect(() => {
    if (isGuest) return
    if (messages && messages.length) markConversationRead(conversation.id, me.uid)
  }, [messages, conversation.id, me.uid, isGuest])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const otherLastRead = conversation.lastReadAt?.[otherUID]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    if (usePreviewStore.getState().requireAccount('Create a free account to send messages.')) return
    setSending(true)
    const body = text
    setText('')
    try {
      await sendMessage(conversation.id, { uid: me.uid, name: me.displayName }, otherUID, body)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border p-4">
        <Avatar name={otherName} size="sm" />
        <span className="font-semibold text-fg">{otherName}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4" aria-live="polite" aria-label="Messages">
        {!messages ? (
          <Spinner label="Loading messages" />
        ) : messages.length === 0 ? (
          <EmptyState icon={Mail} title="Say hello" message={`Start the conversation with ${otherName}.`} />
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => {
              const mine = m.senderUID === me.uid
              const isRead =
                mine && otherLastRead && m.createdAt && otherLastRead.toMillis() >= m.createdAt.toMillis()
              const mineMsgs = messages.filter((x) => x.senderUID === me.uid)
              const isLastMine = mine && mineMsgs[mineMsgs.length - 1]?.id === m.id
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  mine={mine}
                  meUID={me.uid}
                  conversationId={conversation.id}
                  showRead={!!isRead && !!isLastMine}
                />
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
        <label htmlFor="msg" className="sr-only">
          Message {otherName}
        </label>
        <input
          id="msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="min-h-touch flex-1 rounded-btn border border-border bg-page px-3 text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Send message"
          className="flex h-11 w-11 items-center justify-center rounded-btn bg-brand text-brand-fg disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </>
  )
}

function MessageBubble({
  message,
  mine,
  meUID,
  conversationId,
  showRead,
}: {
  message: Message
  mine: boolean
  meUID: string
  conversationId: string
  showRead: boolean
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const reactions = Object.values(message.reactions ?? {}).filter(Boolean)
  const myReaction = message.reactions?.[meUID]

  return (
    <div className={cn('group flex flex-col', mine ? 'items-end' : 'items-start')}>
      <div className={cn('flex items-center gap-1', mine && 'flex-row-reverse')}>
        <div
          className={cn(
            'max-w-md rounded-card px-3 py-2 text-sm',
            mine ? 'bg-brand text-brand-fg' : 'bg-muted text-fg',
          )}
        >
          {message.text}
        </div>
        <div className="relative opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="Add reaction"
            className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-muted"
          >
            <SmilePlus className="h-4 w-4" />
          </button>
          {pickerOpen && (
            <div className="absolute z-10 mt-1 flex gap-1 rounded-chip border border-border bg-card p-1 shadow-elevated">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    if (usePreviewStore.getState().requireAccount('Create a free account to react to messages.')) {
                      return
                    }
                    toggleReaction(conversationId, message.id, meUID, emoji, myReaction)
                    setPickerOpen(false)
                  }}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-muted',
                    myReaction === emoji && 'bg-brand-tint',
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={cn('mt-0.5 flex items-center gap-1 px-1', mine && 'flex-row-reverse')}>
        <span className="text-[11px] text-fg-muted">{messageTime(message.createdAt)}</span>
        {reactions.length > 0 && (
          <span className="rounded-full bg-muted px-1.5 text-xs">{reactions.join('')}</span>
        )}
        {showRead && <span className="text-[11px] text-fg-muted">· Read</span>}
      </div>
    </div>
  )
}
