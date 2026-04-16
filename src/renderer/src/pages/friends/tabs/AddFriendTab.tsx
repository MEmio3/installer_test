import { useState } from 'react'
import { UserPlus, Check, AlertCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useFriendsStore } from '@/stores/friends.store'

function AddFriendTab(): JSX.Element {
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error' | 'invalid'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const sendFriendRequest = useFriendsStore((s) => s.sendFriendRequest)

  const [mrUserId, setMrUserId] = useState('')
  const [mrContent, setMrContent] = useState('')
  const [mrStatus, setMrStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [mrError, setMrError] = useState<string>('')
  const sendMessageRequest = useFriendsStore((s) => s.sendMessageRequest)

  const handleSend = async (): Promise<void> => {
    const trimmed = userId.trim()
    if (!trimmed.startsWith('usr_') || trimmed.length < 10) {
      setStatus('invalid')
      return
    }
    const res = await sendFriendRequest(trimmed)
    if (res.success) {
      setStatus('sent')
      setTimeout(() => {
        setStatus('idle')
        setUserId('')
      }, 3000)
    } else {
      setErrorMsg(res.error || 'Failed to send.')
      setStatus('error')
    }
  }

  const handleMrSend = async (): Promise<void> => {
    const trimmed = mrUserId.trim()
    const content = mrContent.trim()
    if (!content) return
    const res = await sendMessageRequest(trimmed, content)
    if (res.success) {
      setMrStatus('sent')
      setTimeout(() => {
        setMrStatus('idle')
        setMrUserId('')
        setMrContent('')
      }, 3000)
    } else {
      setMrError(res.error || 'Failed to send.')
      setMrStatus('error')
    }
  }

  return (
    <div className="px-6 py-2">
      <h3 className="text-lg font-bold text-mesh-text-primary mb-1">Add Friend</h3>
      <p className="text-sm text-mesh-text-muted mb-6">
        Enter a User ID to send a friend request. User IDs start with <code className="text-mesh-green">usr_</code>
      </p>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value)
              if (status !== 'idle') setStatus('idle')
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="usr_a3f9b2c1d4e5..."
            className="w-full h-12 px-4 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary font-mono placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none"
          />
        </div>
        <Button onClick={handleSend} disabled={!userId.trim() || status === 'sent'} className="shrink-0">
          Send Friend Request
        </Button>
      </div>

      {status === 'sent' && (
        <div className="flex items-center gap-2 mt-3 text-mesh-green text-sm">
          <Check className="h-4 w-4" /> Friend request sent!
        </div>
      )}
      {status === 'invalid' && (
        <div className="flex items-center gap-2 mt-3 text-mesh-danger text-sm">
          <AlertCircle className="h-4 w-4" /> Invalid User ID. Must start with usr_ and be at least 10 characters.
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 mt-3 text-mesh-danger text-sm">
          <AlertCircle className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      {/* Cold Message Request */}
      <div className="mt-10 pt-8 border-t border-mesh-border">
        <h3 className="text-lg font-bold text-mesh-text-primary mb-1 flex items-center gap-2">
          <Mail className="h-5 w-5 text-mesh-info" />
          Send a Message Request
        </h3>
        <p className="text-sm text-mesh-text-muted mb-4">
          Send a one-off message to a non-friend. It will appear in their Message Requests tab.
        </p>
        <input
          value={mrUserId}
          onChange={(e) => {
            setMrUserId(e.target.value)
            if (mrStatus !== 'idle') setMrStatus('idle')
          }}
          placeholder="usr_..."
          className="w-full h-11 px-4 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary font-mono placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none mb-3"
        />
        <textarea
          value={mrContent}
          onChange={(e) => setMrContent(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-mesh-bg-tertiary text-sm text-mesh-text-primary placeholder:text-mesh-text-muted focus:outline-none focus:ring-1 focus:ring-mesh-border border-none resize-none mb-3"
        />
        <Button onClick={handleMrSend} disabled={!mrUserId.trim() || !mrContent.trim() || mrStatus === 'sent'}>
          Send Message Request
        </Button>
        {mrStatus === 'sent' && (
          <div className="flex items-center gap-2 mt-3 text-mesh-green text-sm">
            <Check className="h-4 w-4" /> Message request sent!
          </div>
        )}
        {mrStatus === 'error' && (
          <div className="flex items-center gap-2 mt-3 text-mesh-danger text-sm">
            <AlertCircle className="h-4 w-4" /> {mrError}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-12 text-center">
        <div className="h-20 w-20 rounded-2xl bg-mesh-bg-tertiary flex items-center justify-center mb-4">
          <UserPlus className="h-10 w-10 text-mesh-green/60" />
        </div>
        <p className="text-sm text-mesh-text-muted max-w-xs">
          Share your User ID with others so they can add you, or paste theirs above to connect.
        </p>
      </div>
    </div>
  )
}

export { AddFriendTab }
