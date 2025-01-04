'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MeditationCalendar } from '@/app/components/habits/meditation/MeditationCalendar'

export default function MeditationPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-[2000px] mx-auto p-6 space-y-8">
        {/* Хедер */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-white/70 hover:text-white/90 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </motion.button>
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-sans font-thin tracking-tight text-white/90"
          >
            {format(new Date(), 'd MMMM', { locale: ru })}
          </motion.h1>

          {/* Пустой div для выравнивания */}
          <div className="w-6" />
        </div>

        {/* Календарь */}
        <MeditationCalendar />
      </div>
    </div>
  )
} 