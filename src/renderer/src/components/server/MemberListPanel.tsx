import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useIdentityStore } from '@/stores/identity.store'
import { useServersStore } from '@/stores/servers.store'
import { useAvatarStore } from '@/stores/avatar.store'
import type { ServerMember, ServerRole } from '@/types/server'

interface MemberListPanelProps {
  serverId: string
  members: ServerMember[]
}

const roleOrder: ServerRole[] = ['host', 'moderator', 'member']
const roleLabels: Record<ServerRole, string> = {
  host: 'Host',
  moderator: 'Moderators',
  member: 'Members',
}
const roleBadgeColors: Record<ServerRole, string> = {
  host: 'bg-mesh-green text-white',
  moderator: 'bg-mesh-info text-white',
  member: '',
}

interface MenuState {
  x: number
  y: number
  target: ServerMember
}

function MemberListPanel({ serverId, members }: MemberListPanelProps): JSX.Element {
  const identity = useIdentityStore((s) => s.identity)
  const muteMember = useServersStore((s) => s.muteMember)
  const kickMember = useServersStore((s) => s.kickMember)
  const banMember = useServersStore((s) => s.banMember)
  const setMemberRole = useServersStore((s) => s.setMemberRole)

  const [menu, setMenu] = useState<MenuState | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const selfId = identity?.userId
  const selfRole: ServerRole | null =
    members.find((m) => m.userId === selfId)?.role ?? null
  const canModerate = selfRole === 'host' || selfRole === 'moderator'
  const isHost = selfRole === 'host'
  const selfAvatar = useAvatarStore((s) => s.self)
  const avatarsByUser = useAvatarStore((s) => s.byUser)

  useEffect(() => {
    const close = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null)
    }
    if (menu) document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menu])

  const grouped = roleOrder
    .map((role) => ({ role, members: members.filter((m) => m.role === role) }))
    .filter((g) => g.members.length > 0)

  function openMenu(e: React.MouseEvent, target: ServerMember): void {
    e.preventDefault()
    if (!canModerate) return
    if (target.userId === selfId) return
    if (target.role === 'host') return
    setMenu({ x: e.clientX, y: e.clientY, target })
  }

  return (
    <div className="w-56 h-full border-l border-mesh-border/50 bg-mesh-bg-secondary overflow-y-auto py-3">
      {grouped.map((group) => (
        <div key={group.role} className="mb-4">
          <div className="px-4 pb-1.5">
            <span className="text-[11px] font-semibold text-mesh-text-muted uppercase tracking-wide">
              {roleLabels[group.role]} — {group.members.length}
            </span>
          </div>
          {group.members.map((member) => (
            <div
              key={member.userId}
              onContextMenu={(e) => openMenu(e, member)}
              className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-mesh-bg-tertiary/50 transition-colors cursor-pointer"
            >
              <Avatar fallback={member.username} size="sm" status={member.status} src={member.userId === selfId ? selfAvatar : avatarsByUser[member.userId]} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'text-sm truncate',
                    member.status === 'offline' ? 'text-mesh-text-muted' : 'text-mesh-text-primary'
                  )}>
                    {member.username}
                  </span>
                  {member.role !== 'member' && (
                    <span className={cn(
                      'text-[9px] font-bold uppercase px-1 py-0.5 rounded',
                      roleBadgeColors[member.role]
                    )}>
                      {member.role === 'host' ? 'HOST' : 'MOD'}
                    </span>
                  )}
                  {member.isMuted && (
                    <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-mesh-bg-tertiary text-mesh-text-muted">
                      MUTED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {menu && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-[100] min-w-[180px] bg-mesh-bg-elevated border border-mesh-border/50 rounded-lg shadow-xl py-1.5 animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col"
        >
          <button
            onClick={() => { muteMember(serverId, menu.target.userId, !menu.target.isMuted); setMenu(null) }}
            className="flex items-center gap-2.5 w-[calc(100%-8px)] px-2.5 py-1.5 text-sm rounded-sm mx-1 text-left transition-colors text-mesh-text-secondary hover:bg-mesh-green hover:text-white"
          >
            {menu.target.isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button
            onClick={() => { kickMember(serverId, menu.target.userId); setMenu(null) }}
            className="flex items-center gap-2.5 w-[calc(100%-8px)] px-2.5 py-1.5 text-sm rounded-sm mx-1 text-left transition-colors text-red-400 hover:bg-red-500 hover:text-white"
          >
            Kick
          </button>
          {isHost && (
            <>
              <div className="h-px bg-mesh-border/50 my-1 mx-2" />
              <button
                onClick={() => { banMember(serverId, menu.target.userId); setMenu(null) }}
                className="flex items-center gap-2.5 w-[calc(100%-8px)] px-2.5 py-1.5 text-sm rounded-sm mx-1 text-left transition-colors text-red-400 hover:bg-red-500 hover:text-white"
              >
                Ban
              </button>
              {menu.target.role === 'member' ? (
                <button
                  onClick={() => { setMemberRole(serverId, menu.target.userId, 'moderator'); setMenu(null) }}
                  className="flex items-center gap-2.5 w-[calc(100%-8px)] px-2.5 py-1.5 text-sm rounded-sm mx-1 text-left transition-colors text-mesh-text-secondary hover:bg-mesh-green hover:text-white"
                >
                  Promote to Moderator
                </button>
              ) : (
                <button
                  onClick={() => { setMemberRole(serverId, menu.target.userId, 'member'); setMenu(null) }}
                  className="flex items-center gap-2.5 w-[calc(100%-8px)] px-2.5 py-1.5 text-sm rounded-sm mx-1 text-left transition-colors text-mesh-text-secondary hover:bg-mesh-green hover:text-white"
                >
                  Demote to Member
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export { MemberListPanel }
