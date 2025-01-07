'use client'

import { useState } from 'react'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useSleepSessions } from '@/app/hooks/useSleepSessions'
import { useTelegram } from '@/app/hooks/useTelegram'

export default function SleepPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { sessions } = useSleepSessions()
  const { isExpanded } = useTelegram()

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isExpanded ? 'pt-[100px]' : ''}`}>
      {/* Хедер */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
        >
          <Icon icon="solar:arrow-left-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
        </motion.button>
        <h1 className="text-2xl font-light text-[#E8D9C5]">Сон</h1>
      </div>

      {/* Календарь */}
      <UniversalCalendarGrid 
        currentDate={currentDate}
        sessions={sessions}
        mode="sleep"
        onMonthChange={setCurrentDate}
      />
    </div>
  )
} 