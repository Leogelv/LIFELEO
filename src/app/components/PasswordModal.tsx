'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

interface PasswordModalProps {
  onSuccess: () => void
  correctPassword: string
}

export function PasswordModal({ onSuccess, correctPassword }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === correctPassword) {
      // Сохраняем в localStorage, что пароль был введен правильно
      localStorage.setItem('passwordVerified', 'true')
      onSuccess()
    } else {
      setError('Неверный пароль')
      setPassword('')
    }
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-[#1A1A1A] rounded-xl p-6 w-full max-w-md border border-[#333]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#333] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:lock-password-bold" className="w-8 h-8 text-[#E8D9C5]" />
          </div>
          <h2 className="text-xl font-bold text-[#E8D9C5] mb-2">Вход в LIFELEO</h2>
          <p className="text-[#E8D9C5]/70 text-sm">Введите пароль для доступа к приложению</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Введите пароль"
                className="w-full bg-[#2A2A2A] border border-[#444] rounded-lg px-4 py-3 text-[#E8D9C5] focus:outline-none focus:ring-2 focus:ring-[#E8D9C5]/30"
                autoFocus
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E8D9C5]/50 hover:text-[#E8D9C5]"
              >
                <Icon icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"} className="w-5 h-5" />
              </button>
            </div>
            
            {error && (
              <motion.p 
                className="text-red-400 text-sm mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#E8D9C5]/20 to-[#E8D9C5]/30 hover:from-[#E8D9C5]/30 hover:to-[#E8D9C5]/40 text-[#E8D9C5] font-medium py-3 px-4 rounded-lg transition-all"
          >
            Войти
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
} 