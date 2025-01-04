'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function ModalBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 10 + 5,
          duration: Math.random() * 10 + 10,
          delay: Math.random() * 5
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Градиентный фон */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl"
      />

      {/* Анимированные частицы */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 0,
            x: `${particle.x}%`,
            y: `${particle.y}%`
          }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.2, 1],
            x: [`${particle.x}%`, `${particle.x + 10}%`, `${particle.x}%`],
            y: [`${particle.y}%`, `${particle.y - 10}%`, `${particle.y}%`]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
          style={{
            width: particle.size,
            height: particle.size
          }}
        />
      ))}

      {/* Дополнительные градиентные эффекты */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/10 to-transparent" />
    </div>
  )
} 