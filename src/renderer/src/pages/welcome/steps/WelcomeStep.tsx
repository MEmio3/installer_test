import { motion } from 'framer-motion'

interface WelcomeStepProps {
  onNext: () => void
}

function WelcomeStep({ onNext }: WelcomeStepProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      {/* Logo with glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-8"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-[60px] rounded-full bg-mesh-green/30 scale-150" />

        {/* Logo block */}
        <div className="relative flex items-center justify-center h-24 w-24 rounded-2xl bg-mesh-green shadow-lg shadow-mesh-green/20">
          <span className="text-4xl font-black text-white tracking-tight">M</span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-4xl font-bold text-mesh-text-primary mb-3 tracking-tight"
      >
        Welcome to MESH
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="text-mesh-text-secondary text-lg mb-2"
      >
        Decentralized. Private. Yours.
      </motion.p>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="text-mesh-text-muted text-sm max-w-sm mb-10"
      >
        A communication platform with no central server. Your identity, your data,
        your network — controlled by you.
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="px-8 py-3 rounded-lg bg-mesh-green hover:bg-mesh-green-light text-white font-semibold text-base transition-colors shadow-lg shadow-mesh-green/20"
      >
        Get Started
      </motion.button>
    </div>
  )
}

export { WelcomeStep }
