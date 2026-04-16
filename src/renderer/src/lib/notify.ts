/**
 * Renderer-side notify helper (Task 8).
 *
 * Centralises the "should we fire a desktop notification?" policy:
 *  - Master toggle (`notifications.enabled`)
 *  - Per-type toggle (dm / friend-request / call / server-kick / server-message)
 *  - Skip when the window is focused AND the user is already on the relevant route
 *    (e.g. viewing the active DM conversation — no point pinging them).
 *
 * For each notification, main displays an Electron `Notification`. Click is
 * wired in App.tsx: focuses the window and navigates via HashRouter.
 */

import { useSettingsStore } from '@/stores/settings.store'

type NotifyType = 'dm' | 'friend-request' | 'call' | 'server-kick' | 'server-message'

interface NotifyArgs {
  type: NotifyType
  title: string
  body: string
  /** Hash route to navigate to on click, e.g. '/channels/@me/dm_abc'. */
  route?: string
  /** If true, skip even when on the same route (e.g. unread-while-scrolled-up). */
  force?: boolean
}

/** Map type → user-controlled toggle key. */
function isTypeEnabled(type: NotifyType): boolean {
  const s = useSettingsStore.getState().notifications
  if (!s.enabled) return false
  switch (type) {
    case 'dm':
      return s.dmNotifications
    case 'friend-request':
      return s.friendRequestNotifications
    case 'call':
      return s.callNotifications
    case 'server-kick':
      return s.serverKickNotifications
    case 'server-message':
      return s.serverNotifications
    default:
      return true
  }
}

/** Current HashRouter path (everything after the '#'). */
function currentRoute(): string {
  const hash = window.location.hash || ''
  return hash.startsWith('#') ? hash.slice(1) : hash
}

export async function notify(args: NotifyArgs): Promise<void> {
  if (!isTypeEnabled(args.type)) return

  // Suppress desktop toast when the user is already looking at the same place.
  const focused = document.hasFocus()
  if (!args.force && focused && args.route && currentRoute() === args.route) return

  try {
    const sound = useSettingsStore.getState().notifications.sound
    await window.api.notifications.show({
      type: args.type,
      title: args.title,
      body: args.body,
      route: args.route,
      silent: !sound
    })
  } catch (err) {
    // Non-fatal — notifications are best-effort.
    console.warn('notify failed', err)
  }
}
