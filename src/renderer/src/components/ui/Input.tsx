import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3 rounded-md bg-mesh-bg-tertiary border text-mesh-text-primary text-sm',
            'placeholder:text-mesh-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-mesh-green focus:border-transparent',
            'transition-colors duration-150',
            error ? 'border-mesh-danger' : 'border-mesh-border',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-mesh-danger">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input, type InputProps }
