'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TimerComponentProps {
  duration: number // в минутах
  onComplete: () => void
  isActive: boolean
}

export function TimerComponent({ duration, onComplete, isActive }: TimerComponentProps) {
  const [timeLeftMinutes, setTimeLeftMinutes] = useState(duration)
  
  useEffect(() => {
    if (!isActive) return
    
    const timer = setInterval(() => {
      setTimeLeftMinutes((prev) => {
        const newTime = prev - 1/60
        if (newTime <= 0) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, onComplete])

  const minutes = Math.floor(timeLeftMinutes)
  const seconds = Math.floor((timeLeftMinutes % 1) * 60)

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Пульсирующий круг */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.2, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full"
      />
      
      {/* Таймер */}
      <motion.div 
        className="relative z-10 w-48 h-48 rounded-full bg-gray-800/80 backdrop-blur-xl
          border border-gray-700/50 flex items-center justify-center"
      >
        <span className="text-4xl font-bold text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </motion.div>
    </motion.div>
  )
} 