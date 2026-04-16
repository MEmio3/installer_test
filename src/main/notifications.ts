/**
 * Desktop notifications (Task 8).
 *
 * Thin wrapper around Electron's Notification API. The renderer calls
 * `notification:show` with a payload; we display it, and on click we
 * focus+show the main window and forward `notification:clicked` back to
 * the renderer so it can navigate (HashRouter route).
 */

import { BrowserWindow, Notification } from 'electron'

export type NotifyType = 'dm' | 'friend-request' | 'call' | 'server-kick' | 'server-message'

export interface NotifyPayload {
  type: NotifyType
  title: string
  body: string
  /** HashRouter path to navigate to when the user clicks (e.g. '/channels/@me/dm_xxx'). */
  route?: string
  silent?: boolean
}

let mainWindowRef: BrowserWindow | null = null

export function setNotificationsWindow(win: BrowserWindow): void {
  mainWindowRef = win
}

export function showNotification(payload: NotifyPayload): { success: boolean } {
  if (!Notification.isSupported()) return { success: false }

  const n = new Notification({
    title: payload.title,
    body: payload.body,
    silent: payload.silent ?? false
  })

  n.on('click', () => {
    const win = mainWindowRef
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
      win.webContents.send('notification:clicked', { type: payload.type, route: payload.route })
    }
  })

  n.show()
  return { success: true }
}
