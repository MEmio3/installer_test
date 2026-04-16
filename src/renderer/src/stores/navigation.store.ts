import { create } from 'zustand'

type ActiveSection = 'home' | 'server' | 'settings'

interface NavigationStore {
  activeSection: ActiveSection
  activeServerId: string | null
  setActiveSection: (section: ActiveSection) => void
  setActiveServer: (serverId: string | null) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeSection: 'home',
  activeServerId: null,
  setActiveSection: (section) => set({ activeSection: section }),
  setActiveServer: (serverId) =>
    set({ activeServerId: serverId, activeSection: serverId ? 'server' : 'home' }),
}))
