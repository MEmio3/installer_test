import { create } from 'zustand'
import type { UserIdentity } from '@/types/identity'

interface IdentityStore {
  identity: UserIdentity | null
  isOnboarded: boolean
  isLoading: boolean
  setIdentity: (identity: UserIdentity) => void
  clearIdentity: () => void
  initialize: () => Promise<void>
}

export const useIdentityStore = create<IdentityStore>((set) => ({
  identity: null,
  isOnboarded: false,
  isLoading: true,

  setIdentity: (identity) => set({ identity, isOnboarded: true, isLoading: false }),
  clearIdentity: () => set({ identity: null, isOnboarded: false }),

  initialize: async () => {
    try {
      const exists = await window.api.identityExists()
      if (exists) {
        const data = await window.api.identityLoad()
        if (data) {
          set({
            identity: {
              userId: data.userId,
              publicKey: data.publicKey,
              username: data.username,
              avatarPath: data.avatarColor,
              createdAt: data.createdAt
            },
            isOnboarded: true,
            isLoading: false
          })
          return
        }
      }
    } catch (err) {
      console.error('Failed to load identity:', err)
    }
    set({ isLoading: false })
  }
}))
