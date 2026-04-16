import { useFriendsStore } from '@/stores/friends.store'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ShieldOff } from 'lucide-react'

function BlockedTab(): JSX.Element {
  const blockedUsers = useFriendsStore((s) => s.blockedUsers)
  const unblockUser = useFriendsStore((s) => s.unblockUser)

  return (
    <div className="flex flex-col gap-2 px-3">
      <div className="px-3 pb-1">
        <span className="text-[11px] font-semibold text-mesh-text-muted uppercase tracking-wide">
          Blocked — {blockedUsers.length}
        </span>
      </div>

      {blockedUsers.length > 0 ? (
        blockedUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-mesh-bg-tertiary/60 transition-colors"
          >
            <Avatar fallback={user.username} size="md" status="offline" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-mesh-text-primary block truncate">
                {user.username}
              </span>
              <span className="text-xs text-mesh-text-muted">Blocked</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => unblockUser(user.userId)}
            >
              Unblock
            </Button>
          </div>
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <ShieldOff className="h-16 w-16 text-mesh-text-muted mb-4 stroke-1" />
          <h3 className="text-lg font-semibold text-mesh-text-primary mb-2">No blocked users</h3>
          <p className="text-sm text-mesh-text-muted max-w-xs text-center mb-8">
            You haven't blocked anyone.
          </p>
        </div>
      )}
    </div>
  )
}

export { BlockedTab }
