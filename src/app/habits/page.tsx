'use client'

import { HabitsList } from '../components/habits/HabitsList'
import { motion } from 'framer-motion'

export default function HabitsPage() {
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
        <HabitsList />
      </motion.div>
    </div>
  )
} 