'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TelegramLayout } from './components/layouts/TelegramLayout'

export default function HomePage() {
  const [userId, setUserId] = useState<string>('375634162') // Дефолтный userId
  const [username, setUsername] = useState<string>('') 
  const [photoUrl, setPhotoUrl] = useState<string>('')

  useEffect(() => {
    // Проверяем наличие Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      // Здесь можно получить данные пользователя из Telegram WebApp
      if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user
        setUsername(user.username || '')
        setPhotoUrl(user.photo_url || '')
      }
    }
  }, [])

  return (
    <TelegramLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="py-6"
        >
          <div className="flex items-center justify-between">
            <div className="w-[88px]" />
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ViPassana
              </h1>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/contacts"
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
                  bg-white/5 hover:bg-white/10 transition-colors"
              >
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={username}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                <span>TG: {username || 'User'}</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Водный баланс */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/habits/water"
                className="block p-6 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]
                  hover:border-[#E8D9C5]/20 transition-all duration-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 
                    flex items-center justify-center">
                    <span className="text-2xl">💧</span>
                  </div>
                  <h3 className="text-xl font-medium text-[#E8D9C5]">
                    Водный баланс
                  </h3>
                  <p className="text-sm text-[#E8D9C5]/60 text-center">
                    Отслеживайте потребление воды и поддерживайте здоровый баланс
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Спорт */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/habits/sport"
                className="block p-6 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]
                  hover:border-[#E8D9C5]/20 transition-all duration-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 
                    flex items-center justify-center">
                    <span className="text-2xl">🏃‍♂️</span>
                  </div>
                  <h3 className="text-xl font-medium text-[#E8D9C5]">
                    Спортивный дневник
                  </h3>
                  <p className="text-sm text-[#E8D9C5]/60 text-center">
                    Записывайте тренировки и следите за своим прогрессом
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Медитация */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/habits/meditation"
                className="block p-6 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]
                  hover:border-[#E8D9C5]/20 transition-all duration-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 
                    flex items-center justify-center">
                    <span className="text-2xl">🧘‍♂️</span>
                  </div>
                  <h3 className="text-xl font-medium text-[#E8D9C5]">
                    Медитация
                  </h3>
                  <p className="text-sm text-[#E8D9C5]/60 text-center">
                    Практикуйте осознанность и следите за своим прогрессом
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Задачи */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="/habits/tasks"
                className="block p-6 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]
                  hover:border-[#E8D9C5]/20 transition-all duration-500"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                    flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-xl font-medium text-[#E8D9C5]">
                    Задачи
                  </h3>
                  <p className="text-sm text-[#E8D9C5]/60 text-center">
                    Управляйте своими задачами и достигайте целей
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </TelegramLayout>
  )
}
