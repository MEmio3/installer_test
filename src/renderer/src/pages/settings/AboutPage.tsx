import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useIdentityStore } from '@/stores/identity.store'
import { Button } from '@/components/ui/Button'

function AboutPage(): JSX.Element {
  const identity = useIdentityStore((s) => s.identity)
  const [copied, setCopied] = useState(false)

  const handleCopyFingerprint = (): void => {
    if (identity?.publicKey) {
      navigator.clipboard.writeText(identity.publicKey.slice(0, 32))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-lg font-bold text-mesh-text-primary mb-6">About</h2>

      {/* App Info */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-2xl bg-mesh-green flex items-center justify-center shadow-lg shadow-mesh-green/20">
          <span className="text-2xl font-black text-white">M</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-mesh-text-primary">MESH</h3>
          <span className="text-sm text-mesh-text-muted">Version 0.1.0</span>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl bg-mesh-bg-secondary border border-mesh-border p-5 mb-6">
        <p className="text-sm text-mesh-text-secondary leading-relaxed">
          MESH is a decentralized, privacy-first communication platform. No central server,
          no mandatory accounts, no data collection. Your identity is a cryptographic keypair
          generated on your machine — your key is your identity.
        </p>
      </div>

      {/* Links */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-3">
          Links
        </h3>
        <div className="flex flex-col gap-1">
          <LinkItem label="Documentation" />
          <LinkItem label="Source Code" />
          <LinkItem label="Report a Bug" />
          <LinkItem label="License (MIT)" />
        </div>
      </div>

      {/* Identity Fingerprint */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-mesh-text-secondary uppercase tracking-wide mb-3">
          Identity Fingerprint
        </h3>
        <div className="flex items-center gap-2 rounded-lg bg-mesh-bg-tertiary border border-mesh-border px-4 py-3">
          <code className="flex-1 text-xs text-mesh-text-muted font-mono tracking-wider">
            {identity?.publicKey
              ? identity.publicKey.slice(0, 32).replace(/(.{4})/g, '$1 ').trim()
              : 'Not generated'}
          </code>
          <button
            onClick={handleCopyFingerprint}
            className="shrink-0 h-7 w-7 rounded flex items-center justify-center text-mesh-text-muted hover:text-mesh-text-primary hover:bg-mesh-bg-hover transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-mesh-green" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-[11px] text-mesh-text-muted mt-1.5">
          Share this fingerprint to verify your identity with trusted contacts.
        </p>
      </div>

      {/* Update */}
      <Button variant="secondary" className="w-full">
        Check for Updates
      </Button>

      {/* Credits */}
      <div className="mt-8 pt-6 border-t border-mesh-border/30 text-center">
        <p className="text-xs text-mesh-text-muted">
          Built with Electron, React, and WebRTC
        </p>
        <p className="text-xs text-mesh-text-muted mt-1">
          Decentralized. Private. Yours.
        </p>
      </div>
    </div>
  )
}

function LinkItem({ label }: { label: string }): JSX.Element {
  return (
    <button className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-mesh-text-secondary hover:text-mesh-text-primary hover:bg-mesh-bg-tertiary/50 transition-colors text-left">
      {label}
      <ExternalLink className="h-3.5 w-3.5 text-mesh-text-muted" />
    </button>
  )
}

export { AboutPage }
