import { useEffect, useRef, useState } from 'react'
import { X, ShieldOff, Mail, Send, UserPlus, ArrowLeft } from 'lucide-react'
import { useFriendsStore } from '@/stores/friends.store'
import { useIdentityStore } from '@/stores/identity.store'
import { Avatar } from '@/components/ui/Avatar'
import type { MessageRequest, MessageRequestThreadMessage } from '@/types/social'

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ThreadView({ request, onBack }: { request: MessageRequest; onBack: () => void }): JSX.Element {
  const { loadMessageRequestThread, replyMessageRequest, blockFromMessageRequest, sendFriendRequest } = useFriendsStore()
  const selfId = useIdentityStore((s) => s.identity?.userId)
  const [messages, setMessages] = useState<MessageRequestThreadMessage[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const otherUserId = request.direction === 'incoming' ? request.fromUserId : request.toUserId
  const otherUsername = request.direction === 'incoming' ? request.fromUsername : (request.toUsername || request.toUserId)

  const refresh = async (): Promise<void> => {
    const thread = await loadMessageRequestThread(otherUserId)
    setMessages(thread)
  }

  useEffect(() => {
    refresh()
    // Poll for incoming thread messages while panel is open
    const iv = setInterval(refresh, 2000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  // If this is our outgoing request and recipient hasn't replied, sending is blocked.
  const canSend =
    request.direction === 'incoming' ||
    (request.direction === 'outgoing' && request.status === 'replied')

  const handleSend = async (): Promise<void> => {
    const trimmed = input.trim()
    if (!trimmed) return
    setError('')
    const res = await replyMessageRequest(otherUserId, trimmed)
    if (res.success) {
      setInput('')
      await refresh()
    } else {
      setError(res.error || 'Failed to send.')
    }
  }

  const handleBlock = async (): Promise<void> => {
    await blockFromMessageRequest(otherUserId, otherUsername)
    onBack()
  }

  const handleAddFriend = async (): Promise<void> => {
    const res = await sendFriendRequest(otherUserId)
    if (!res.success) setError(res.error || 'Could not send friend request.')
    else setError('Friend request sent.')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-mesh-border">
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-mesh-bg-tertiary text-mesh-text-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar fallback={otherUsername} size="sm" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-mesh-text-primary block truncate">{otherUsername}</span>
          <span className="text-[11px] text-mesh-text-muted font-mono">{otherUserId}</span>
        </div>
        <button
          onClick={handleAddFriend}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-mesh-green/20 text-mesh-green text-xs font-medium hover:bg-mesh-green hover:text-white transition-colors"
          title="Send Friend Request"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Friend
        </button>
        <button
          onClick={handleBlock}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-mesh-bg-elevated text-mesh-text-muted text-xs font-medium hover:bg-mesh-danger hover:text-white transition-colors"
          title="Block"
        >
          <ShieldOff className="h-3.5 w-3.5" />
          Block
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-xs text-mesh-text-muted text-center py-6">No messages yet.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === selfId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? 'bg-mesh-green/20 text-mesh-text-primary' : 'bg-mesh-bg-tertiary text-mesh-text-primary'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <span className="text-[10px] text-mesh-text-muted mt-1 block">{formatTime(m.timestamp)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-mesh-border">
        {!canSend && (
          <p className="text-xs text-mesh-text-muted mb-2">
            Waiting for {otherUsername} to reply before you can send more messages.
          </p>
        )}
        {error && <p className="text-xs text-mesh-danger mb-2">{error}</p>}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            disabled={!canSend}
            placeholder={canSend ? 'Type a message…' : 'Cannot send yet'}
            className="flex-1 h-10 px-3 rounded-lg bg-mesh-bg-tertiary border border-mesh-border text-sm text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-2 focus:ring-mesh-green disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!canSend || !input.trim()}
            className="h-10 w-10 rounded-lg bg-mesh-green text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageRequestPanel(): JSX.Element {
  const messageRequests = useFriendsStore((s) => s.messageRequests)
  const { ignoreMessageRequest, blockFromMessageRequest } = useFriendsStore()
  const [openThread, setOpenThread] = useState<MessageRequest | null>(null)

  if (openThread) {
    // Pick up latest state for this thread if it changed
    const latest = messageRequests.find((r) => r.id === openThread.id) ?? openThread
    return <ThreadView request={latest} onBack={() => setOpenThread(null)} />
  }

  if (messageRequests.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <Mail className="h-16 w-16 text-mesh-text-muted mb-4 stroke-1" />
        <h3 className="text-lg font-semibold text-mesh-text-primary mb-2">No message requests</h3>
        <p className="text-sm text-mesh-text-muted max-w-xs text-center mb-8">
          Cold messages from non-friends will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 px-3">
      <div className="px-3 pb-2">
        <span className="text-[11px] font-semibold text-mesh-text-muted uppercase tracking-wide">
          Message Requests — {messageRequests.length}
        </span>
      </div>

      {messageRequests.map((req) => {
        const otherId = req.direction === 'incoming' ? req.fromUserId : req.toUserId
        const otherName = req.direction === 'incoming' ? req.fromUsername : (req.toUsername || req.toUserId)
        const statusLabel =
          req.direction === 'outgoing'
            ? req.status === 'replied' ? 'Replied' : 'Pending'
            : req.status === 'ignored' ? 'Ignored' : 'New'
        return (
          <button
            key={req.id}
            onClick={() => setOpenThread(req)}
            className="flex flex-col gap-2 px-3 py-3 rounded-lg bg-mesh-bg-tertiary/40 hover:bg-mesh-bg-tertiary/70 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Avatar fallback={otherName} size="sm" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-mesh-text-primary truncate block">{otherName}</span>
                <span className="text-[10px] text-mesh-text-muted font-mono">
                  {req.direction === 'outgoing' ? 'To ' : 'From '}
                  {otherId}
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                  statusLabel === 'Replied'
                    ? 'bg-mesh-green/20 text-mesh-green'
                    : statusLabel === 'Ignored'
                      ? 'bg-mesh-bg-elevated text-mesh-text-muted'
                      : 'bg-mesh-info/20 text-mesh-info'
                }`}
              >
                {statusLabel}
              </span>
              <span className="text-[10px] text-mesh-text-muted shrink-0">{formatTime(req.timestamp)}</span>
            </div>

            <p className="text-sm text-mesh-text-secondary pl-10 line-clamp-2">{req.messagePreview}</p>

            {req.direction === 'incoming' && req.status !== 'ignored' && (
              <div className="flex items-center gap-2 pl-10 pt-1">
                <span className="text-xs text-mesh-text-muted">Click to reply · or</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    ignoreMessageRequest(req.id)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-mesh-bg-elevated text-mesh-text-muted text-xs font-medium hover:bg-mesh-bg-hover hover:text-mesh-text-primary transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" /> Ignore
                </span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    blockFromMessageRequest(otherId, otherName)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-mesh-bg-elevated text-mesh-text-muted text-xs font-medium hover:bg-mesh-danger hover:text-white transition-colors cursor-pointer"
                >
                  <ShieldOff className="h-3 w-3" /> Block
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { MessageRequestPanel }
