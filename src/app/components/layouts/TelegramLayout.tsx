'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TelegramLayoutProps {
  children: React.ReactNode
}

export function TelegramLayout({ children }: TelegramLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsExpanded(window.Telegram.WebApp.isExpanded)
      
      window.Telegram.WebApp.onEvent('viewportChanged', () => {
        setIsExpanded(window.Telegram.WebApp.isExpanded)
      })
    }
  }, [])

  return (
    <main className={`min-h-screen relative overflow-hidden ${isExpanded ? 'pt-[100px]' : ''}`}>
      {/* Анимированные градиенты на фоне */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: ['-25%', '25%', '-25%'],
            y: ['-25%', '15%', '-25%'],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: ['25%', '-25%', '25%'],
            y: ['15%', '-25%', '15%'],
            scale: [1.2, 1, 1.2]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: ['-15%', '25%', '-15%'],
            y: ['25%', '-15%', '25%'],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </main>
  )
} 