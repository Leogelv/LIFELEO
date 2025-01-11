'use client'

import { useState } from 'react'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useSportSessions } from '@/app/hooks/useSportSessions'
import { useTelegram } from '@/app/hooks/useTelegram'
import { AddHabitModal } from '@/app/components/habits/AddHabitModal'

export default function SportPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { sessions } = useSportSessions()
  const { isExpanded } = useTelegram()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // Преобразуем тип intensity для совместимости с UniversalCalendarGrid
  const formattedSessions = sessions.map(session => ({
    ...session,
    intensity: session.intensity as 'low' | 'medium' | 'high'
  }))

  return (
    <div className={`min-h-screen bg-gray-900 text-white p-4 ${isExpanded ? 'pt-[100px]' : ''}`}>
      {/* Хедер */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-1.5 md:p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
            >
              <Icon icon="solar:arrow-left-outline" className="w-5 h-5 md:w-6 md:h-6 text-[#E8D9C5]/60" />
            </motion.button>
            <h1 className="text-xl md:text-2xl font-light text-[#E8D9C5]">Спорт</h1>
          </div>

          {/* Кнопки добавления */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 transition-colors"
            >
              <Icon icon="solar:add-circle-outline" className="w-5 h-5 text-[#E8D9C5]" />
              <span className="text-sm text-[#E8D9C5]">Сейчас</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-colors"
            >
              <Icon icon="solar:calendar-add-outline" className="w-5 h-5 text-[#E8D9C5]" />
              <span className="text-sm text-[#E8D9C5]">История</span>
            </motion.button>
          </div>
        </div>

        {/* Календарь */}
        <UniversalCalendarGrid 
          currentDate={currentDate}
          sessions={formattedSessions}
          mode="sport"
          onMonthChange={setCurrentDate}
        />
      </div>

      {/* Модальные окна */}
      <AddHabitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="sport"
        onSuccess={() => {
          setIsModalOpen(false)
        }}
      />

      <AddHabitModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        mode="sport"
        withDateTime
        onSuccess={() => {
          setIsHistoryModalOpen(false)
        }}
      />
    </div>
  )
} 