'use client'

import { useEffect } from 'react'
import { logger } from '@/utils/logger'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTelegram } from './hooks/useTelegram'
import { Icon } from '@iconify/react'

export default function Home() {
  const { isExpanded } = useTelegram()

  useEffect(() => {
    logger.info('Главная страница загружена')
  }, [])

  const handleTasksClick = () => {
    logger.debug('Переход на страницу задач')
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-zinc-900 text-white relative ${isExpanded ? 'pt-[100px]' : ''}`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-900/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,0,0,0))]" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, 
              rgba(120, 119, 198, 0.1) 0%, 
              rgba(120, 119, 198, 0.05) 25%, 
              transparent 50%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent"
          >
            LIFELEO
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-[95%] mx-auto">
            {/* Задачи */}
            <Link href="/tasks" onClick={handleTasksClick}>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10
                  hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium">Задачи</h2>
                    <Icon icon="solar:checklist-minimalistic-bold" className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-white/60">
                    Управляйте задачами и заметками
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Привычки */}
            <Link href="/habits">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10
                  hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium">Привычки</h2>
                    <Icon icon="solar:cycling-bold" className="w-6 h-6 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-white/60">
                    Отслеживайте привычки и прогресс
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Контакты */}
            <Link href="/contacts">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10
                  hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium">Контакты</h2>
                    <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-white/60">
                    Управляйте контактами и анализируйте общение
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}