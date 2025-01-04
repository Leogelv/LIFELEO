'use client'

import { useState } from 'react'
import { MdArrowBack } from 'react-icons/md'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TelegramLayout } from '@/app/components/layouts/TelegramLayout'
import { MeditationModal } from './modal/MeditationModal'

export default function MeditationPage() {
  const [showModal, setShowModal] = useState(false)

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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
                  bg-white/5 hover:bg-white/10 transition-colors"
              >
                <MdArrowBack className="w-6 h-6" />
                <span>Назад</span>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Медитация
              </h1>
            </motion.div>
            <div className="w-[88px]" />
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
            {/* Кнопка "Начать медитацию" */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="p-6 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]
                hover:border-[#E8D9C5]/20 transition-all duration-500"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 
                  flex items-center justify-center">
                  <span className="text-2xl">🧘‍♂️</span>
                </div>
                <h3 className="text-xl font-medium text-[#E8D9C5]">
                  Начать медитацию
                </h3>
                <p className="text-sm text-[#E8D9C5]/60 text-center">
                  Выберите длительность и начните медитировать прямо сейчас
                </p>
              </div>
            </motion.button>

            {/* Кнопка "Статистика" */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]
                hover:border-[#E8D9C5]/20 transition-all duration-500"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 
                  flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-medium text-[#E8D9C5]">
                  Статистика
                </h3>
                <p className="text-sm text-[#E8D9C5]/60 text-center">
                  Просмотрите свой прогресс и историю медитаций
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Модальное окно медитации */}
      <MeditationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </TelegramLayout>
  )
} 