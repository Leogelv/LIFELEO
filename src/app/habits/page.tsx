'use client'

import { HabitsList } from '../components/habits/HabitsList'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format, startOfDay, endOfDay } from 'date-fns'

export default function HabitsPage() {
  const [totalMeditationMinutes, setTotalMeditationMinutes] = useState(0)

  useEffect(() => {
    const fetchMeditationStats = async () => {
      const supabase = createClient()
      const today = new Date()
      
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('duration')
        .gte('date', format(startOfDay(today), 'yyyy-MM-dd'))
        .lte('date', format(endOfDay(today), 'yyyy-MM-dd'))

      if (error) {
        console.error('Error fetching meditation stats:', error)
        return
      }

      const total = data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0
      setTotalMeditationMinutes(total)
    }

    fetchMeditationStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header с градиентным бордером */}
      <div className="relative mb-8 p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 
              text-gray-300 hover:text-white transition-all duration-200"
          >
            <span>←</span>
            <span>Назад</span>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
            text-transparent bg-clip-text">
            Привычки
          </h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Основной контент */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <HabitsList totalMeditationMinutes={totalMeditationMinutes} />
      </motion.div>
    </div>
  )
} 