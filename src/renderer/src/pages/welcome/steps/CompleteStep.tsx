import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface CompleteStepProps {
  username: string
  onEnter: () => void
}

function CompleteStep({ username, onEnter }: CompleteStepProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
        className="relative mb-8"
      >
        {/* Glow ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute inset-0 blur-[40px] rounded-full bg-mesh-green/30 scale-150"
        />

        {/* Circle with check */}
        <div className="relative h-24 w-24 rounded-full bg-mesh-green flex items-center justify-center shadow-lg shadow-mesh-green/30">
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </motion.div>
        </div>
      </motion.div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-2xl font-bold text-mesh-text-primary mb-2"
      >
        You're all set, {username}!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="text-mesh-text-muted text-sm max-w-sm mb-10"
      >
        Your decentralized identity is ready. Connect to a relay, find friends,
        and start communicating — privately and securely.
      </motion.p>

      {/* Enter button */}
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEnter}
        className="px-10 py-3.5 rounded-lg bg-mesh-green hover:bg-mesh-green-light text-white font-semibold text-base transition-colors shadow-lg shadow-mesh-green/20"
      >
        Enter MESH
      </motion.button>
    </div>
  )
}

export { CompleteStep }
