import { create } from 'zustand'
import { webrtcManager } from '@/lib/webrtc'

/**
 * Apply ICE configuration to the WebRTC manager based on user settings.
 * - p2p-first: empty iceServers, transport 'all' (pure P2P, no TURN).
 * - relay-fallback: iceServers from registered relays (if any), transport 'all'.
 * - relay-only: iceServers from relays, transport 'relay' (force TURN).
 *
 * Per MESH design: no external STUN/TURN by default — only user-registered coturn relays.
 */
async function applyIceConfig(strategy: 'p2p-first' | 'relay-fallback' | 'relay-only'): Promise<void> {
  if (strategy === 'p2p-first') {
    webrtcManager.setIceConfig([], 'all')
    return
  }

  const relays = await window.api.db.relays.list()
  const iceServers: RTCIceServer[] = relays.map((r) => ({ urls: r.address }))

  if (strategy === 'relay-only') {
    webrtcManager.setIceConfig(iceServers, 'relay')
  } else {
    webrtcManager.setIceConfig(iceServers, 'all')
  }
}

interface AppearanceSettings {
  fontSize: number
  chatDensity: 'compact' | 'cozy' | 'default'
  messageGroupingMinutes: number
  animationsEnabled: boolean
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  dmNotifications: boolean
  serverNotifications: boolean
  friendRequestNotifications: boolean
  callNotifications: boolean
  serverKickNotifications: boolean
}

interface NetworkSettings {
  preferredIceStrategy: 'p2p-first' | 'relay-fallback' | 'relay-only'
  customRelays: string[]
  /** If true, this machine runs the embedded signaling server. */
  hostSignaling: boolean
  /** URL of the signaling server to connect to (own when hosting, else peer's). */
  signalingUrl: string
}

interface PrivacySettings {
  hideFromDiscovery: boolean
  invisibleMode: boolean
}

interface SettingsStore {
  appearance: AppearanceSettings
  notifications: NotificationSettings
  network: NetworkSettings
  privacy: PrivacySettings

  initialize: () => Promise<void>
  updateAppearance: (partial: Partial<AppearanceSettings>) => void
  updateNotifications: (partial: Partial<NotificationSettings>) => void
  updateNetwork: (partial: Partial<NetworkSettings>) => void
  updatePrivacy: (partial: Partial<PrivacySettings>) => void
  addCustomRelay: (address: string) => void
  removeCustomRelay: (address: string) => void
}

const DEFAULT_APPEARANCE: AppearanceSettings = {
  fontSize: 14,
  chatDensity: 'default',
  messageGroupingMinutes: 5,
  animationsEnabled: true
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: true,
  sound: true,
  dmNotifications: true,
  serverNotifications: true,
  friendRequestNotifications: true,
  callNotifications: true,
  serverKickNotifications: true
}

const DEFAULT_NETWORK: NetworkSettings = {
  preferredIceStrategy: 'p2p-first',
  customRelays: [],
  hostSignaling: false,
  signalingUrl: 'http://localhost:3000'
}

const DEFAULT_PRIVACY: PrivacySettings = {
  hideFromDiscovery: false,
  invisibleMode: false
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  appearance: { ...DEFAULT_APPEARANCE },
  notifications: { ...DEFAULT_NOTIFICATIONS },
  network: { ...DEFAULT_NETWORK },
  privacy: { ...DEFAULT_PRIVACY },

  initialize: async () => {
    const [appearanceRaw, notificationsRaw, networkRaw, privacyRaw] = await Promise.all([
      window.api.db.settings.get('appearance'),
      window.api.db.settings.get('notifications'),
      window.api.db.settings.get('network'),
      window.api.db.settings.get('privacy')
    ])

    const network = networkRaw ? { ...DEFAULT_NETWORK, ...JSON.parse(networkRaw) } : { ...DEFAULT_NETWORK }
    const privacy = privacyRaw ? { ...DEFAULT_PRIVACY, ...JSON.parse(privacyRaw) } : { ...DEFAULT_PRIVACY }

    set({
      appearance: appearanceRaw ? { ...DEFAULT_APPEARANCE, ...JSON.parse(appearanceRaw) } : { ...DEFAULT_APPEARANCE },
      notifications: notificationsRaw ? { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(notificationsRaw) } : { ...DEFAULT_NOTIFICATIONS },
      network,
      privacy
    })

    // Apply ICE config to WebRTC manager on load
    applyIceConfig(network.preferredIceStrategy)
  },

  updateAppearance: (partial) => {
    set((s) => {
      const updated = { ...s.appearance, ...partial }
      window.api.db.settings.set('appearance', JSON.stringify(updated))
      return { appearance: updated }
    })
  },

  updateNotifications: (partial) => {
    set((s) => {
      const updated = { ...s.notifications, ...partial }
      window.api.db.settings.set('notifications', JSON.stringify(updated))
      return { notifications: updated }
    })
  },

  updateNetwork: (partial) => {
    set((s) => {
      const updated = { ...s.network, ...partial }
      window.api.db.settings.set('network', JSON.stringify(updated))
      // Re-apply ICE config when the strategy (or relay list impact) changes
      applyIceConfig(updated.preferredIceStrategy)
      return { network: updated }
    })
  },

  updatePrivacy: (partial) => {
    set((s) => {
      const updated = { ...s.privacy, ...partial }
      window.api.db.settings.set('privacy', JSON.stringify(updated))
      return { privacy: updated }
    })
  },

  addCustomRelay: (address) => {
    set((s) => {
      const updated = { ...s.network, customRelays: [...s.network.customRelays, address] }
      window.api.db.settings.set('network', JSON.stringify(updated))
      return { network: updated }
    })
  },

  removeCustomRelay: (address) => {
    set((s) => {
      const updated = { ...s.network, customRelays: s.network.customRelays.filter((r) => r !== address) }
      window.api.db.settings.set('network', JSON.stringify(updated))
      return { network: updated }
    })
  }
}))
