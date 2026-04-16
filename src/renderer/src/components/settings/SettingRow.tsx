import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
  separator?: boolean
}

function SettingRow({ label, description, children, separator = true }: SettingRowProps): JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-mesh-text-primary block">
            {label}
          </span>
          {description && (
            <span className="text-xs text-mesh-text-muted block mt-0.5">
              {description}
            </span>
          )}
        </div>
        <div className="shrink-0">
          {children}
        </div>
      </div>
      {separator && <div className="h-px bg-mesh-border/30" />}
    </div>
  )
}

export { SettingRow }
