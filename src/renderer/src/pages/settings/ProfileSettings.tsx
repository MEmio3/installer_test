import { useEffect, useState } from 'react'
import { Copy, Check, Camera } from 'lucide-react'
import { useIdentityStore } from '@/stores/identity.store'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAvatarStore } from '@/stores/avatar.store'

function ProfileSettings(): JSX.Element {
  const identity = useIdentityStore((s) => s.identity)
  const selfAvatar = useAvatarStore((s) => s.self)
  const uploadSelf = useAvatarStore((s) => s.uploadSelf)
  const [copied, setCopied] = useState<'id' | 'key' | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(identity?.username || '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    useAvatarStore.getState().initialize()
  }, [])

  const handleAvatarClick = async (): Promise<void> => {
    if (uploading) return
    setUploading(true)
    setUploadError(null)
    const res = await uploadSelf()
    if (!res.success && res.error) setUploadError(res.error)
    setUploading(false)
  }

  const handleCopy = (text: string, type: 'id' | 'key'): void => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-lg font-bold text-mesh-text-primary mb-6">My Profile</h2>

      {/* Profile Card Preview */}
      <div className="rounded-xl bg-mesh-bg-secondary border border-mesh-border p-5 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative group shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-mesh-green disabled:opacity-60"
            title="Upload profile picture (JPG/PNG, max 2MB)"
          >
            <Avatar
              src={selfAvatar}
              fallback={identity?.username || 'U'}
              size="xl"
              status="online"
            />
            <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </span>
          </button>
          <div className="flex-1 min-w-0 pt-1">
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  maxLength={24}
                  className="h-8 px-2 rounded bg-mesh-bg-tertiary border border-mesh-border text-sm text-mesh-text-primary focus:outline-none focus:ring-2 focus:ring-mesh-green"
                />
                <Button size="sm" onClick={() => setEditingName(false)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNewName(identity?.username || '') }}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-mesh-text-primary">
                  {identity?.username || 'MeshUser'}
                </span>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(true)}>Edit</Button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-mesh-green">Online</span>
            </div>
            {uploadError && (
              <p className="text-[11px] text-red-400 mt-1">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* User ID */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2">
          User ID
        </label>
        <div className="flex items-center gap-2 rounded-lg bg-mesh-bg-tertiary border border-mesh-border px-4 py-3">
          <code className="flex-1 text-sm text-mesh-green font-mono truncate">
            {identity?.userId || 'usr_not_generated'}
          </code>
          <button
            onClick={() => handleCopy(identity?.userId || '', 'id')}
            className="shrink-0 h-7 w-7 rounded flex items-center justify-center text-mesh-text-muted hover:text-mesh-text-primary hover:bg-mesh-bg-hover transition-colors"
          >
            {copied === 'id' ? <Check className="h-3.5 w-3.5 text-mesh-green" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-[11px] text-mesh-text-muted mt-1.5">
          Your permanent identity. Share this with others so they can add you.
        </p>
      </div>

      {/* Public Key */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2">
          Public Key
        </label>
        <div className="flex items-center gap-2 rounded-lg bg-mesh-bg-tertiary border border-mesh-border px-4 py-3">
          <code className="flex-1 text-[11px] text-mesh-text-muted font-mono truncate">
            {identity?.publicKey || 'not generated'}
          </code>
          <button
            onClick={() => handleCopy(identity?.publicKey || '', 'key')}
            className="shrink-0 h-7 w-7 rounded flex items-center justify-center text-mesh-text-muted hover:text-mesh-text-primary hover:bg-mesh-bg-hover transition-colors"
          >
            {copied === 'key' ? <Check className="h-3.5 w-3.5 text-mesh-green" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-[11px] text-mesh-text-muted mt-1.5">
          Your cryptographic public key. Used to verify your identity on the network.
        </p>
      </div>

      {/* Account Created */}
      <div>
        <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2">
          Account Created
        </label>
        <span className="text-sm text-mesh-text-secondary">
          {identity?.createdAt
            ? new Date(identity.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Unknown'}
        </span>
      </div>
    </div>
  )
}

export { ProfileSettings }
