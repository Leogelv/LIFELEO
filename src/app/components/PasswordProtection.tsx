'use client'

import { useState, useEffect } from 'react'
import { useTelegram } from '../hooks/useTelegram'
import { PasswordModal } from './PasswordModal'
import { AnimatePresence } from 'framer-motion'

interface PasswordProtectionProps {
  children: React.ReactNode
}

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const { showPasswordModal, handlePasswordSuccess, ENV_PASSWORD, isTelegramWebApp } = useTelegram()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Если компонент не смонтирован, показываем заглушку
  if (!mounted) {
    return <div className="min-h-screen bg-[#1A1A1A]">{children}</div>
  }

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showPasswordModal && !isTelegramWebApp && (
          <PasswordModal 
            onSuccess={handlePasswordSuccess} 
            correctPassword={ENV_PASSWORD}
          />
        )}
      </AnimatePresence>
    </>
  )
} 