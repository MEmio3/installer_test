import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useIdentityStore } from '@/stores/identity.store'
import { initializeAllStores } from '@/stores/init'
import { WelcomeStep } from './steps/WelcomeStep'
import { ProfileSetupStep } from './steps/ProfileSetupStep'
import { KeyGenerationStep } from './steps/KeyGenerationStep'
import { CompleteStep } from './steps/CompleteStep'

type Step = 'welcome' | 'profile' | 'keygen' | 'complete'

// Avatar colors matching ProfileSetupStep
const avatarColors = ['#107C10', '#0078d4', '#8764B8', '#d13438', '#ffb900', '#00B7C3', '#E74856', '#767676']

function WelcomePage(): JSX.Element {
  const navigate = useNavigate()
  const setIdentity = useIdentityStore((s) => s.setIdentity)

  const [step, setStep] = useState<Step>('welcome')
  const [profileData, setProfileData] = useState<{ username: string; avatarIndex: number } | null>(null)

  const handleProfileDone = (data: { username: string; avatarIndex: number }): void => {
    setProfileData(data)
    setStep('keygen')
  }

  const handleKeygenDone = (keypair: { userId: string; publicKey: string }): void => {
    if (profileData) {
      setIdentity({
        userId: keypair.userId,
        publicKey: keypair.publicKey,
        username: profileData.username,
        avatarPath: avatarColors[profileData.avatarIndex] || null,
        createdAt: Date.now(),
      })
    }
    setStep('complete')
  }

  const handleEnter = async (): Promise<void> => {
    // Initialize all stores from DB now that identity exists
    await initializeAllStores()
    navigate('/channels/@me')
  }

  return (
    <div className="h-screen w-screen bg-mesh-bg-primary overflow-hidden">
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-mesh-text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-mesh-text-muted) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative h-full"
        >
          {step === 'welcome' && (
            <WelcomeStep onNext={() => setStep('profile')} />
          )}
          {step === 'profile' && (
            <ProfileSetupStep
              onNext={handleProfileDone}
              onBack={() => setStep('welcome')}
            />
          )}
          {step === 'keygen' && profileData && (
            <KeyGenerationStep
              username={profileData.username}
              avatarColor={avatarColors[profileData.avatarIndex] || null}
              onNext={handleKeygenDone}
            />
          )}
          {step === 'complete' && profileData && (
            <CompleteStep
              username={profileData.username}
              onEnter={handleEnter}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export { WelcomePage }
