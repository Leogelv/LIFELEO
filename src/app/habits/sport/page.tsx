'use client'

import { useState } from 'react'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useSportSessions } from '@/app/hooks/useSportSessions'

export default function SportPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { sessions } = useSportSessions()

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-4 md:p-8">
      {/* Хедер */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
        >
          <Icon icon="solar:arrow-left-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
        </motion.button>
        <h1 className="text-2xl font-light text-[#E8D9C5]">Спорт</h1>
      </div>

      {/* Календарь */}
      <UniversalCalendarGrid 
        currentDate={currentDate}
        sessions={sessions}
        mode="sport"
        onMonthChange={setCurrentDate}
      />
    </div>
  )
} 