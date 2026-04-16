import { useEffect, useState } from 'react'
import { Avatar, type AvatarSize, type StatusType } from './Avatar'
import { useAvatarStore } from '@/stores/avatar.store'
import { useIdentityStore } from '@/stores/identity.store'

interface UserAvatarProps {
  userId?: string | null
  fallback: string
  size?: AvatarSize
  status?: StatusType
  className?: string
}

/**
 * Avatar that auto-resolves the image for a userId (self or friend).
 * Falls back to coloured initials when no picture is available.
 */
function UserAvatar({ userId, fallback, size, status, className }: UserAvatarProps): JSX.Element {
  const selfId = useIdentityStore((s) => s.identity?.userId)
  const selfAvatar = useAvatarStore((s) => s.self)
  const byUser = useAvatarStore((s) => s.byUser)
  const ensureFor = useAvatarStore((s) => s.ensureFor)

  const isSelf = userId && selfId && userId === selfId
  const [, force] = useState(0)

  useEffect(() => {
    if (!userId || isSelf) return
    if (byUser[userId] === undefined) ensureFor(userId).then(() => force((n) => n + 1))
  }, [userId, isSelf, byUser, ensureFor])

  const src = isSelf ? selfAvatar : userId ? byUser[userId] ?? null : null

  return <Avatar src={src} fallback={fallback} size={size} status={status} className={className} />
}

export { UserAvatar }
