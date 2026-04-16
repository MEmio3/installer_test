import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings.store'
import { useDiscoveryStore } from '@/stores/discovery.store'
import { useStatusStore } from '@/stores/status.store'

function PrivacySettings(): JSX.Element {
  const privacy = useSettingsStore((s) => s.privacy)
  const updatePrivacy = useSettingsStore((s) => s.updatePrivacy)
  const publishSelf = useDiscoveryStore((s) => s.publishSelf)
  const applyInvisibleChange = useStatusStore((s) => s.applyInvisibleChange)

  useEffect(() => { publishSelf() }, [privacy.hideFromDiscovery, publishSelf])
  useEffect(() => { applyInvisibleChange() }, [privacy.invisibleMode, applyInvisibleChange])

  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-lg font-bold text-mesh-text-primary mb-6">Privacy</h2>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-mesh-border bg-mesh-bg-secondary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-mesh-text-primary">
                Hide me from discovery
              </h3>
              <p className="text-xs text-mesh-text-muted mt-1">
                Other users connected to the same relay won't see you in “People Nearby”.
                You can still send and receive messages normally.
              </p>
            </div>
            <button
              onClick={() => updatePrivacy({ hideFromDiscovery: !privacy.hideFromDiscovery })}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.hideFromDiscovery ? 'bg-mesh-green' : 'bg-mesh-bg-tertiary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  privacy.hideFromDiscovery ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-mesh-border bg-mesh-bg-secondary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-mesh-text-primary">
                Invisible mode
              </h3>
              <p className="text-xs text-mesh-text-muted mt-1">
                Appear offline to everyone, including friends. You can still use MESH normally.
              </p>
            </div>
            <button
              onClick={() => updatePrivacy({ invisibleMode: !privacy.invisibleMode })}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.invisibleMode ? 'bg-mesh-green' : 'bg-mesh-bg-tertiary'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  privacy.invisibleMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PrivacySettings }
