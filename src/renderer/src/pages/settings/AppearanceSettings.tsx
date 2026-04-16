import { useSettingsStore } from '@/stores/settings.store'
import { SettingRow } from '@/components/settings/SettingRow'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/utils'

const densityOptions = [
  { value: 'compact' as const, label: 'Compact' },
  { value: 'default' as const, label: 'Default' },
  { value: 'cozy' as const, label: 'Cozy' },
]

function AppearanceSettings(): JSX.Element {
  const appearance = useSettingsStore((s) => s.appearance)
  const updateAppearance = useSettingsStore((s) => s.updateAppearance)

  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-lg font-bold text-mesh-text-primary mb-6">Appearance</h2>

      {/* Theme */}
      <SettingRow label="Theme" description="MESH uses a dark theme inspired by Xbox">
        <div className="flex items-center gap-2">
          <div className="h-8 px-3 rounded-md bg-mesh-green text-white text-sm font-medium flex items-center">
            Dark
          </div>
        </div>
      </SettingRow>

      {/* Font Size */}
      <SettingRow label="Font Size" description="Adjust the base text size across the app">
        <Slider
          value={appearance.fontSize}
          min={12}
          max={18}
          onChange={(v) => updateAppearance({ fontSize: v })}
          label={`${appearance.fontSize}px`}
          className="w-48"
        />
      </SettingRow>

      {/* Chat Density */}
      <SettingRow label="Chat Density" description="Control spacing between messages">
        <div className="flex rounded-lg overflow-hidden border border-mesh-border">
          {densityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateAppearance({ chatDensity: opt.value })}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                appearance.chatDensity === opt.value
                  ? 'bg-mesh-green text-white'
                  : 'bg-mesh-bg-tertiary text-mesh-text-secondary hover:text-mesh-text-primary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Message Grouping */}
      <SettingRow label="Message Grouping" description="Group consecutive messages from the same sender within this interval">
        <Slider
          value={appearance.messageGroupingMinutes}
          min={2}
          max={10}
          onChange={(v) => updateAppearance({ messageGroupingMinutes: v })}
          label={`${appearance.messageGroupingMinutes}m`}
          className="w-48"
        />
      </SettingRow>

      {/* Animations */}
      <SettingRow label="Animations" description="Enable smooth transitions and motion effects" separator={false}>
        <Toggle
          checked={appearance.animationsEnabled}
          onChange={(v) => updateAppearance({ animationsEnabled: v })}
        />
      </SettingRow>
    </div>
  )
}

export { AppearanceSettings }
