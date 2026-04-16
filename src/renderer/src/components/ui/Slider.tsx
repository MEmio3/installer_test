import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
  className?: string
}

function Slider({ value, min, max, step = 1, onChange, label, className }: SliderProps): JSX.Element {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mesh-slider flex-1"
        style={{
          background: `linear-gradient(to right, var(--color-mesh-green) 0%, var(--color-mesh-green) ${percent}%, var(--color-mesh-bg-elevated) ${percent}%, var(--color-mesh-bg-elevated) 100%)`,
        }}
      />
      {label && (
        <span className="text-sm text-mesh-text-primary font-medium min-w-[32px] text-right">
          {label}
        </span>
      )}
    </div>
  )
}

export { Slider }
