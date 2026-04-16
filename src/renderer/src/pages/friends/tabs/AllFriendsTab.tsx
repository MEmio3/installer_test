import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { useFriendsStore } from '@/stores/friends.store'
import { FriendItem } from '@/components/social/FriendItem'

function AllFriendsTab(): JSX.Element {
  const friends = useFriendsStore((s) => s.friends)
  const [search, setSearch] = useState('')

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  )

  // Sort: online first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    const aOnline = a.status !== 'offline' ? 0 : 1
    const bOnline = b.status !== 'offline' ? 0 : 1
    if (aOnline !== bOnline) return aOnline - bOnline
    return a.username.localeCompare(b.username)
  })

  return (
    <div className="flex flex-col gap-2">
      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mesh-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all friends"
            className="w-full h-9 pl-9 pr-3 rounded-md bg-mesh-bg-tertiary border border-mesh-border text-sm text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-2 focus:ring-mesh-green"
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-6 pt-2">
        <span className="text-[11px] font-semibold text-mesh-text-muted uppercase tracking-wide">
          All Friends — {sorted.length}
        </span>
      </div>

      {/* List */}
      <div className="px-3">
        {sorted.length > 0 ? (
          sorted.map((friend) => (
            <FriendItem key={friend.userId} friend={friend} />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-16 w-16 text-mesh-text-muted mb-4 stroke-1" />
            <h3 className="text-lg font-semibold text-mesh-text-primary mb-2">No friends yet</h3>
            <p className="text-sm text-mesh-text-muted max-w-xs text-center mb-8">
              {search ? 'No matches found.' : 'Start adding friends to build your mesh.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export { AllFriendsTab }
