import type { Message } from '@/types/messages'
import { MessageBubble } from './MessageBubble'
import { useScrollAnchor } from '@/hooks/useScrollAnchor'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { useIdentityStore } from '@/stores/identity.store'

interface MessageFeedProps {
  messages: Message[]
  recipientName: string
  onEditMessage?: (messageId: string, newContent: string) => void
  onDeleteMessage?: (messageId: string) => void
  onToggleReaction?: (messageId: string, emojiId: string) => void
  onReply?: (msg: Message) => void
  /**
   * Predicate: can the local user delete this specific message?
   * Default is sender-only (handled inside MessageBubble).
   * Servers pass a predicate that also allows host/mod to delete any.
   */
  canDeleteMessage?: (msg: Message) => boolean
}

const GROUPING_THRESHOLD = 5 * 60 * 1000 // 5 minutes

function formatDateDivider(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function shouldShowDateDivider(current: Message, previous: Message | undefined): boolean {
  if (!previous) return true
  const curDate = new Date(current.timestamp).toDateString()
  const prevDate = new Date(previous.timestamp).toDateString()
  return curDate !== prevDate
}

function isGrouped(current: Message, previous: Message | undefined): boolean {
  if (!previous) return false
  if (current.senderId !== previous.senderId) return false
  if (current.timestamp - previous.timestamp > GROUPING_THRESHOLD) return false
  // If there's a date divider between them, don't group
  if (new Date(current.timestamp).toDateString() !== new Date(previous.timestamp).toDateString()) return false
  return true
}

function MessageFeed({ messages, recipientName: _recipientName, onEditMessage, onDeleteMessage, onToggleReaction, onReply, canDeleteMessage }: MessageFeedProps): JSX.Element {
  const { containerRef, isAtBottom, scrollToBottom } = useScrollAnchor()
  const myId = useIdentityStore((s) => s.identity?.userId)

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <MessageCircle className="h-12 w-12 text-mesh-text-muted stroke-1" />
        <h3 className="text-lg font-semibold text-mesh-text-primary">No messages yet</h3>
        <p className="text-sm text-mesh-text-muted max-w-xs text-center">
          Send a message to start the conversation
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto pb-2"
      >
        {messages.map((msg, i) => {
          const prev = i > 0 ? messages[i - 1] : undefined
          const showDate = shouldShowDateDivider(msg, prev)
          const grouped = isGrouped(msg, prev)

          return (
            <div key={msg.id}>
              {/* Date divider */}
              {showDate && (
                <div className="flex items-center justify-center px-4 py-3 my-2 relative">
                  <div className="absolute left-4 right-4 h-px bg-mesh-border border-t" />
                  <span className="relative text-[11px] font-semibold text-mesh-text-muted bg-mesh-bg-secondary px-2 z-10 leading-none">
                    {formatDateDivider(msg.timestamp)}
                  </span>
                </div>
              )}

              <MessageBubble
                message={msg}
                isGrouped={grouped}
                isOwnMessage={msg.senderId === myId}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onToggleReaction={onToggleReaction}
                onReply={onReply}
                canDelete={canDeleteMessage ? canDeleteMessage(msg) : undefined}
              />
            </div>
          )
        })}
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-mesh-green shadow-lg flex items-center justify-center px-4 py-2 text-white hover:bg-mesh-green/90 transition-all gap-1.5 whitespace-nowrap z-20 animate-in"
        >
          <span className="text-xs font-semibold">Jump to present</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { MessageFeed }
