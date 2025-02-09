'use client'

import { motion } from 'framer-motion'

interface MeditationOrbProps {
  progress: number
}

export function MeditationOrb({ progress }: MeditationOrbProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Внешнее свечение */}
        <motion.div
          className="absolute -inset-8 rounded-full bg-purple-400/10 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Дополнительное свечение */}
        <motion.div
          className="absolute -inset-6 rounded-full bg-fuchsia-400/10 blur-xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }}
        />

        {/* Основная сфера */}
        <motion.div
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-400/40 to-fuchsia-400/40 backdrop-blur-sm"
          style={{
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Внутреннее свечение */}
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-400/20"
            animate={{
              scale: [0.8, 1, 0.8],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Частицы */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-purple-400/60"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 4) * 50],
                  y: [0, Math.sin(i * Math.PI / 4) * 50],
                  opacity: [0, 0.8, 0],
                  scale: [1, 1.5, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Прогресс */}
        <svg
          className="absolute -inset-8"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Фоновый круг */}
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="2"
            stroke="rgba(168, 85, 247, 0.1)"
            className="rotate-[-90deg] origin-center"
          />
          {/* Прогресс */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="2"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeLinecap="round"
            className="rotate-[-90deg] origin-center"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{
              type: 'spring',
              stiffness: 50,
              damping: 20
            }}
          />
        </svg>
      </motion.div>
    </div>
  )
} 