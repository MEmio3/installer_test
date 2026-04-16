import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileSetupStepProps {
  onNext: (data: { username: string; avatarIndex: number }) => void
  onBack: () => void
}

const defaultAvatars = [
  { bg: '#107C10', label: 'Green' },
  { bg: '#0078d4', label: 'Blue' },
  { bg: '#8764B8', label: 'Purple' },
  { bg: '#d13438', label: 'Red' },
  { bg: '#ffb900', label: 'Gold' },
  { bg: '#00B7C3', label: 'Teal' },
  { bg: '#E74856', label: 'Pink' },
  { bg: '#767676', label: 'Gray' },
]

function ProfileSetupStep({ onNext, onBack }: ProfileSetupStepProps): JSX.Element {
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [error, setError] = useState('')

  const validate = (): boolean => {
    const trimmed = username.trim()
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters')
      return false
    }
    if (trimmed.length > 24) {
      setError('Username must be 24 characters or less')
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Only letters, numbers, and underscores allowed')
      return false
    }
    setError('')
    return true
  }

  const handleContinue = (): void => {
    if (validate()) {
      onNext({ username: username.trim(), avatarIndex: selectedAvatar })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') handleContinue()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-mesh-text-muted hover:text-mesh-text-primary text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h2 className="text-2xl font-bold text-mesh-text-primary mb-1">
          Create your profile
        </h2>
        <p className="text-mesh-text-muted text-sm mb-8">
          This is how others will see you on MESH.
        </p>

        {/* Avatar Selection */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-3">
            Choose an Avatar
          </label>
          <div className="flex gap-3 flex-wrap">
            {defaultAvatars.map((avatar, i) => {
              const initial = username.trim() ? username.trim()[0].toUpperCase() : '?'
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(i)}
                  className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-150',
                    selectedAvatar === i
                      ? 'ring-2 ring-mesh-green ring-offset-2 ring-offset-mesh-bg-primary scale-110'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  )}
                  style={{ backgroundColor: avatar.bg }}
                >
                  {initial}
                </button>
              )
            })}
          </div>
        </div>

        {/* Username Input */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter a username"
            maxLength={24}
            autoFocus
            className={cn(
              'w-full h-11 px-4 rounded-lg bg-mesh-bg-tertiary text-mesh-text-primary text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-mesh-green',
              'placeholder:text-mesh-text-muted',
              error ? 'border-mesh-danger' : 'border-mesh-border'
            )}
          />
          {error && (
            <p className="mt-1.5 text-xs text-mesh-danger">{error}</p>
          )}
          <p className="mt-1.5 text-xs text-mesh-text-muted">
            {username.length}/24 — Letters, numbers, and underscores only
          </p>
        </div>

        {/* Continue */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleContinue}
          disabled={username.trim().length < 2}
          className="w-full py-3 rounded-lg bg-mesh-green hover:bg-mesh-green-light disabled:opacity-40 disabled:hover:bg-mesh-green text-white font-semibold transition-colors"
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  )
}

export { ProfileSetupStep }
