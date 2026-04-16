import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useServersStore } from '@/stores/servers.store'

interface CreateServerModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateServerModal({ isOpen, onClose }: CreateServerModalProps): JSX.Element {
  const navigate = useNavigate()
  const createServer = useServersStore((s) => s.createServer)
  const joinServer = useServersStore((s) => s.joinServer)
  const [name, setName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (): Promise<void> => {
    const trimmed = name.trim()
    const trimmedPass = password.trim()
    if (trimmed.length < 2 || busy) return
    setBusy(true); setError(null)
    
    let passwordHash = null
    if (trimmedPass.length > 0) {
      passwordHash = await window.api.crypto.hashPassword(trimmedPass)
    }

    const res = await createServer({ name: trimmed, passwordHash })
    setBusy(false)
    if (!res.success || !res.serverId) {
      setError(res.error ?? 'Failed to create server')
      return
    }
    onClose()
    setName('')
    setPassword('')
    navigate(`/channels/${res.serverId}`)
  }

  const handleJoin = async (): Promise<void> => {
    const trimmed = joinId.trim()
    const trimmedPass = password.trim()
    if (!trimmed.startsWith('srv_') || busy) return
    setBusy(true); setError(null)

    const requiresPassword = await window.api.server.requiresPassword({ serverId: trimmed })
    if (requiresPassword && trimmedPass.length === 0) {
      setBusy(false)
      setError('This server requires a password.')
      return
    }

    let passwordHash = null
    if (trimmedPass.length > 0) {
      passwordHash = await window.api.crypto.hashPassword(trimmedPass)
    }

    const res = await joinServer(trimmed, passwordHash)
    setBusy(false)
    if (!res.success) {
      setError(res.error ?? 'Failed to join server')
      return
    }
    onClose()
    setJoinId('')
    setPassword('')
    navigate(`/channels/${trimmed}`)
  }

  const handleClose = () => {
    setName('')
    setJoinId('')
    setPassword('')
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'create' ? 'Create a Server' : 'Join a Server'}>
      {/* Mode Switcher */}
      <div className="flex gap-1 mb-5 bg-mesh-bg-primary p-1 rounded-lg">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'create' ? 'bg-mesh-green text-white' : 'text-mesh-text-secondary hover:text-mesh-text-primary hover:bg-mesh-bg-tertiary/50'}`}
        >
          Create
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'join' ? 'bg-mesh-green text-white' : 'text-mesh-text-secondary hover:text-mesh-text-primary hover:bg-mesh-bg-tertiary/50'}`}
        >
          Join
        </button>
      </div>

      {mode === 'create' ? (
        <div>
          <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2">
            Server Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="My Awesome Server"
            maxLength={50}
            autoFocus
            className="w-full h-11 px-4 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none mb-4"
          />
          <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2 mt-4">
            Password (Optional)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Leave blank for public server"
            className="w-full h-11 px-4 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none mb-6"
          />
          <Button onClick={handleCreate} disabled={name.trim().length < 2 || busy} className="w-full">
            {busy ? 'Creating…' : 'Create Server'}
          </Button>
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-3">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2">
            Server ID
          </label>
          <input
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="srv_7b3e1a9c2f4d..."
            autoFocus
            className="w-full h-11 px-4 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary font-mono placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none mb-4"
          />
          <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2 mt-4">
            Password (Optional)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Only if required"
            className="w-full h-11 px-4 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none mb-6"
          />
          <Button onClick={handleJoin} disabled={!joinId.trim().startsWith('srv_') || busy} className="w-full">
            {busy ? 'Joining…' : 'Join Server'}
          </Button>
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-3">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}

export { CreateServerModal }
