import { cn } from '@/lib/utils'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

function Separator({ orientation = 'horizontal', className }: SeparatorProps): JSX.Element {
  return (
    <div
      className={cn(
        'bg-mesh-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
    />
  )
}

export { Separator, type SeparatorProps }
