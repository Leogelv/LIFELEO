'use client'

import { useState } from 'react'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useSportSessions } from '@/app/hooks/useSportSessions'
import { useTelegram } from '@/app/hooks/useTelegram'

export default function SportPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { sessions } = useSportSessions()
  const { isExpanded } = useTelegram()

  // Преобразуем тип intensity для совместимости с UniversalCalendarGrid
  const formattedSessions = sessions.map(session => ({
    ...session,
    intensity: session.intensity as 'low' | 'medium' | 'high'
  }))

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isExpanded ? 'pt-[100px]' : ''}`}>
      {/* Хедер */}
      <div className="flex items-center gap-3 mb-4 md:mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-1.5 md:p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
        >
          <Icon icon="solar:arrow-left-outline" className="w-5 h-5 md:w-6 md:h-6 text-[#E8D9C5]/60" />
        </motion.button>
        <h1 className="text-xl md:text-2xl font-light text-[#E8D9C5]">Спорт</h1>
      </div>

      {/* Календарь */}
      <div className="max-w-4xl mx-auto">
        <UniversalCalendarGrid 
          currentDate={currentDate}
          sessions={formattedSessions}
          mode="sport"
          onMonthChange={setCurrentDate}
        />
      </div>
    </div>
  )
} 