'use client'

import { motion } from 'framer-motion'

interface MeditationStatsProps {
  weeklyStats: {
    total: number
    sessions: number
  }
  monthlyStats: {
    total: number
    sessions: number
  }
}

export function MeditationStats({ weeklyStats, monthlyStats }: MeditationStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Недельная статистика */}
      <motion.div
        key="weekly"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-white/5 p-6
          hover:bg-white/5 transition-all duration-300 group"
      >
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-transparent opacity-0 
          group-hover:opacity-100 transition-opacity duration-300" />

        {/* Контент */}
        <div className="relative space-y-2">
          <h3 className="text-sm font-sans font-thin tracking-tight text-white/50">
            За неделю
          </h3>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-sans font-thin tracking-tight text-white/90">
              {weeklyStats.total} мин
            </span>
            <span className="text-sm font-sans font-thin tracking-tight text-white/50">
              Время медитации
            </span>
          </div>
        </div>
      </motion.div>

      {/* Месячная статистика */}
      <motion.div
        key="monthly"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-white/5 p-6
          hover:bg-white/5 transition-all duration-300 group"
      >
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-transparent opacity-0 
          group-hover:opacity-100 transition-opacity duration-300" />

        {/* Контент */}
        <div className="relative space-y-2">
          <h3 className="text-sm font-sans font-thin tracking-tight text-white/50">
            За месяц
          </h3>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-sans font-thin tracking-tight text-white/90">
              {monthlyStats.total} мин
            </span>
            <span className="text-sm font-sans font-thin tracking-tight text-white/50">
              Время медитации
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 