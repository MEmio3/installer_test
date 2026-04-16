import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

function Toggle({ checked, onChange, disabled, className }: ToggleProps): JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mesh-green disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-mesh-green' : 'bg-mesh-bg-elevated',
        className
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm mt-0.5',
          checked ? 'ml-[22px]' : 'ml-0.5'
        )}
      />
    </button>
  )
}

export { Toggle }
