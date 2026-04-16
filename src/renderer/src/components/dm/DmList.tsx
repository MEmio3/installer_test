import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Plus, MessageSquare } from 'lucide-react'
import { useMessagesStore } from '@/stores/messages.store'
import { DmListItem } from './DmListItem'

function DmList(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const conversations = useMessagesStore((s) => s.conversations)
  const [search, setSearch] = useState('')

  // Sort by last message time (most recent first)
  const sorted = [...conversations]
    .filter((c) => c.recipientName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aTime = a.lastMessage?.timestamp ?? 0
      const bTime = b.lastMessage?.timestamp ?? 0
      return bTime - aTime
    })

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mesh-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find or start a conversation"
            className="w-full h-8 pl-8 pr-2 rounded bg-mesh-bg-tertiary text-xs text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 mt-2">
        <span className="text-[11px] font-semibold text-mesh-text-muted uppercase tracking-wide">
          DIRECT MESSAGES
        </span>
      </div>

      {/* Conversation List */}
      <div className="flex flex-col gap-0.5 pt-1 pb-2">
        {sorted.map((conv) => (
          <DmListItem
            key={conv.id}
            conversation={conv}
            isActive={location.pathname === `/channels/@me/${conv.id}`}
            onClick={() => navigate(`/channels/@me/${conv.id}`)}
          />
        ))}

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-8 text-center px-4">
            <MessageSquare className="h-8 w-8 text-mesh-text-muted mb-3 stroke-1" />
            <h3 className="text-sm font-semibold text-mesh-text-primary mb-1">
              No conversations
            </h3>
            <p className="text-xs text-mesh-text-muted max-w-[150px]">
              {search ? 'No matches found' : 'Find or start a conversation'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export { DmList }
