import { app, dialog, nativeImage } from 'electron'
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const SIZE = 128

function selfAvatarPath(): string {
  return join(app.getPath('userData'), 'avatar.png')
}

function friendAvatarPath(userId: string): string {
  return join(app.getPath('userData'), 'avatars', `${userId}.png`)
}

function ensureFriendAvatarDir(): void {
  const dir = join(app.getPath('userData'), 'avatars')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function resizeToPng(sourcePath: string): Buffer | null {
  const img = nativeImage.createFromPath(sourcePath)
  if (img.isEmpty()) return null
  const resized = img.resize({ width: SIZE, height: SIZE, quality: 'good' })
  return resized.toPNG()
}

function resizeBufferToPng(buf: Buffer): Buffer | null {
  const img = nativeImage.createFromBuffer(buf)
  if (img.isEmpty()) return null
  return img.resize({ width: SIZE, height: SIZE, quality: 'good' }).toPNG()
}

function toDataUrl(png: Buffer): string {
  return `data:image/png;base64,${png.toString('base64')}`
}

export async function pickAndSetAvatar(): Promise<{ success: boolean; error?: string; dataUrl?: string }> {
  const res = await dialog.showOpenDialog({
    title: 'Choose profile picture',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
  })
  if (res.canceled || res.filePaths.length === 0) return { success: false, error: 'cancelled' }
  const src = res.filePaths[0]
  const size = statSync(src).size
  if (size > MAX_BYTES) return { success: false, error: 'File is larger than 2 MB' }
  const png = resizeToPng(src)
  if (!png) return { success: false, error: 'Unsupported image' }
  writeFileSync(selfAvatarPath(), png)
  return { success: true, dataUrl: toDataUrl(png) }
}

export function getSelfAvatarDataUrl(): string | null {
  const p = selfAvatarPath()
  if (!existsSync(p)) return null
  return toDataUrl(readFileSync(p))
}

export function getSelfAvatarPng(): Buffer | null {
  const p = selfAvatarPath()
  if (!existsSync(p)) return null
  return readFileSync(p)
}

export function getFriendAvatarDataUrl(userId: string): string | null {
  const p = friendAvatarPath(userId)
  if (!existsSync(p)) return null
  return toDataUrl(readFileSync(p))
}

export function saveFriendAvatarFromBase64(userId: string, base64: string): { success: boolean; error?: string } {
  try {
    const buf = Buffer.from(base64, 'base64')
    if (buf.byteLength > MAX_BYTES) return { success: false, error: 'too-large' }
    const png = resizeBufferToPng(buf)
    if (!png) return { success: false, error: 'decode-failed' }
    ensureFriendAvatarDir()
    writeFileSync(friendAvatarPath(userId), png)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export function clearSelfAvatar(): { success: boolean } {
  const p = selfAvatarPath()
  if (existsSync(p)) {
    try { writeFileSync(p, Buffer.alloc(0)) } catch { /* ignore */ }
  }
  return { success: true }
}
