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
      exit={{ opacity: 0 }}
      className={`min-h-screen relative overflow-hidden ${isExpanded ? 'pt-[100px]' : ''}`}
    >
      {/* Animated gradient background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-gradient-slow" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-pink-500/5 animate-gradient-slow-reverse" 
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent"
          >
            LIFELEO
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[95%] mx-auto">
            {/* Задачи */}
            <Link href="/tasks" onClick={handleTasksClick}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10
                  hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">Задачи</h2>
                  <Icon icon="solar:checklist-minimalistic-bold" className="w-6 h-6 text-rose-400" />
                </div>
                <p className="text-white/60">
                  Управляйте задачами и заметками
                </p>
              </motion.div>
            </Link>

            {/* Привычки */}
            <Link href="/habits">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10
                  hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">Привычки</h2>
                  <Icon icon="solar:cycling-bold" className="w-6 h-6 text-pink-400" />
                </div>
                <p className="text-white/60">
                  Отслеживайте привычки и прогресс
                </p>
              </motion.div>
            </Link>

            {/* Контакты */}
            <Link href="/contacts">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10
                  hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">Контакты</h2>
                  <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6 text-pink-400" />
                </div>
                <p className="text-white/60">
                  Управляйте контактами и анализируйте общение
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}