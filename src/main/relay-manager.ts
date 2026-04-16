/**
 * Relay Manager — uses node-turn (pure JS TURN server) in-process.
 *
 * No external binaries. No package managers. No platform-specific logic.
 * Works identically on Windows, macOS, and Linux.
 */

import { randomBytes } from 'crypto'
import * as db from './database'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TurnServer = require('node-turn')

export interface RelayStatus {
  running: boolean
  port: number
  scope: 'isp-local' | 'global'
  connections: number
  credentials: { username: string; password: string } | null
  error: string | null
}

interface TurnServerInstance {
  start: () => void
  stop: () => void
}

let server: TurnServerInstance | null = null
let currentStatus: RelayStatus = {
  running: false,
  port: 3478,
  scope: 'isp-local',
  connections: 0,
  credentials: null,
  error: null
}

function generatePassword(): string {
  return randomBytes(24).toString('base64url')
}

/**
 * Start the in-process TURN relay.
 */
export async function startRelay(opts: {
  port?: number
  scope?: 'isp-local' | 'global'
}): Promise<{ success: boolean; error?: string; credentials?: { username: string; password: string } }> {
  if (server) {
    return { success: false, error: 'Relay already running' }
  }

  const port = opts.port ?? 3478
  const scope = opts.scope ?? 'isp-local'
  const username = 'relay'
  const password = generatePassword()

  try {
    server = new TurnServer({
      listeningPort: port,
      authMech: 'long-term',
      credentials: { [username]: password },
      debugLevel: 'OFF',
      realm: 'mesh.relay'
    }) as TurnServerInstance

    server.start()

    currentStatus = {
      running: true,
      port,
      scope,
      connections: 0,
      credentials: { username, password },
      error: null
    }

    return { success: true, credentials: { username, password } }
  } catch (err) {
    server = null
    const error = err instanceof Error ? err.message : String(err)
    currentStatus.error = error
    currentStatus.running = false
    return { success: false, error }
  }
}

/**
 * Stop the running relay.
 */
export function stopRelay(): { success: boolean } {
  if (server) {
    try {
      server.stop()
    } catch {
      // ignore
    }
    server = null
  }
  currentStatus = {
    ...currentStatus,
    running: false,
    connections: 0,
    credentials: null
  }
  return { success: true }
}

/**
 * Get current relay status.
 */
export function getRelayStatus(): RelayStatus {
  return { ...currentStatus }
}

/**
 * Register this relay with a MESH signaling server so peers can discover it.
 */
export async function registerWithSignaling(
  signalingUrl: string,
  address: string,
  scope: 'isp-local' | 'global'
): Promise<{ success: boolean; relayId?: string; error?: string }> {
  try {
    const response = await fetch(`${signalingUrl.replace(/\/$/, '')}/register-relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, scope, credentials: currentStatus.credentials })
    })
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }
    const data = (await response.json()) as { id: string }

    db.addRelay({
      id: data.id,
      address,
      scope,
      latency: null,
      users: 0,
      isCustom: 0
    })

    return { success: true, relayId: data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Shutdown hook for app quit.
 */
export function shutdownRelay(): void {
  if (server) {
    try {
      server.stop()
    } catch {
      // ignore
    }
    server = null
  }
}
