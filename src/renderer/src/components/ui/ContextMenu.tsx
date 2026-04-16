import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  separator?: false
}

interface ContextMenuSeparator {
  separator: true
}

type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator

interface ContextMenuProps {
  items: ContextMenuEntry[]
  children: ReactNode
  className?: string
}

function ContextMenu({ items, children, className }: ContextMenuProps): JSX.Element {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setPosition(null), [])

  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault()
    // Ensure menu doesn't go off-screen
    const x = Math.min(e.clientX, window.innerWidth - 200)
    const y = Math.min(e.clientY, window.innerHeight - items.length * 36 - 16)
    setPosition({ x, y })
  }

  useEffect(() => {
    if (!position) return

    const handleClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close()
      }
    }

    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [position, close])

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      {position &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] min-w-[180px] py-1.5 rounded-lg bg-mesh-bg-elevated border border-mesh-border/50 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
            style={{ left: position.x, top: position.y }}
          >
            {items.map((item, i) => {
              if (item.separator) {
                return <div key={i} className="h-px bg-mesh-border/50 my-1 mx-2" />
              }
              return (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick()
                    close()
                  }}
                  className={cn(
                    'flex items-center gap-2.5 w-[calc(100%-8px)] px-2.5 py-1.5 text-sm rounded-sm mx-1 text-left transition-colors',
                    item.variant === 'danger'
                      ? 'text-red-400 hover:bg-red-500 hover:text-white'
                      : 'text-mesh-text-secondary hover:bg-mesh-green hover:text-white'
                  )}
                >
                  {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}

export { ContextMenu, type ContextMenuEntry }
