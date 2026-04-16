import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mesh-green disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-mesh-green hover:bg-mesh-green-light text-white': variant === 'primary',
            'bg-mesh-bg-tertiary hover:bg-mesh-bg-hover text-mesh-text-primary': variant === 'secondary',
            'bg-mesh-danger hover:bg-mesh-danger-hover text-white': variant === 'danger',
            'bg-transparent hover:bg-mesh-bg-tertiary text-mesh-text-secondary hover:text-mesh-text-primary': variant === 'ghost',
          },
          {
            'h-7 px-3 text-xs': size === 'sm',
            'h-9 px-4 text-sm': size === 'md',
            'h-11 px-6 text-base': size === 'lg',
            'h-8 w-8 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button, type ButtonProps }
