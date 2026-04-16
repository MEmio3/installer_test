import { cn } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type StatusType = 'online' | 'offline' | 'idle' | 'dnd' | 'none'

interface AvatarProps {
  src?: string | null
  fallback: string
  color?: string | null
  size?: AvatarSize
  status?: StatusType
  className?: string
}

const sizeMap: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const statusSizeMap: Record<AvatarSize, string> = {
  xs: 'h-2 w-2 border',
  sm: 'h-2.5 w-2.5 border-[1.5px]',
  md: 'h-3 w-3 border-2',
  lg: 'h-3.5 w-3.5 border-2',
  xl: 'h-4 w-4 border-2',
}

const statusColorMap: Record<StatusType, string> = {
  online: 'bg-mesh-green',
  offline: 'bg-mesh-text-muted',
  idle: 'bg-mesh-warning',
  dnd: 'bg-mesh-danger',
  none: '',
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function stringToColor(str: string): string {
  if (!str) return '#107C10'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 65%, 45%)`
}

function Avatar({ src, fallback, color, size = 'md', status = 'none', className }: AvatarProps): JSX.Element {
  const bgColor = color || stringToColor(fallback)

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={fallback}
          className={cn(
            'rounded-full object-cover bg-mesh-bg-elevated',
            sizeMap[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white select-none',
            sizeMap[size]
          )}
          style={{ backgroundColor: bgColor }}
        >
          {getInitials(fallback)}
        </div>
      )}
      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-mesh-bg-secondary',
            statusSizeMap[size],
            statusColorMap[status]
          )}
        />
      )}
    </div>
  )
}

export { Avatar, type AvatarProps, type AvatarSize, type StatusType }
