'use client'

import { motion } from 'framer-motion'

interface WaveProps {
  progress: number
}

export function Wave({ progress }: WaveProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: '0%' }}
        animate={{ height: `${Math.min(100, progress)}%` }}
        transition={{
          type: 'spring',
          stiffness: 50,
          damping: 20
        }}
      >
        {/* Градиент воды */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-400/30 via-blue-400/20 to-transparent" />

        {/* Волны */}
        <div className="absolute -top-4 left-0 right-0 h-4">
          <motion.div
            className="absolute inset-0 origin-center"
            animate={{
              scale: [1, 1.1, 1],
              y: [0, -4, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 10 C 30 4 70 4 100 10 L 100 10 L 0 10"
                fill="rgba(96, 165, 250, 0.3)"
                animate={{
                  d: [
                    "M 0 10 C 30 4 70 4 100 10 L 100 10 L 0 10",
                    "M 0 10 C 30 6 70 2 100 10 L 100 10 L 0 10",
                    "M 0 10 C 30 4 70 4 100 10 L 100 10 L 0 10"
                  ]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Пузырьки */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400/20"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '0%'
              }}
              animate={{
                y: [0, -100 - Math.random() * 100],
                x: [0, (Math.random() - 0.5) * 50],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
} 