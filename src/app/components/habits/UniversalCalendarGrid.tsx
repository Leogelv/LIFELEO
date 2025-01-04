'use client'

import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { GiMuscleUp } from 'react-icons/gi'
import { BsMoonStars } from 'react-icons/bs'
import { RiWaterFlashLine } from 'react-icons/ri'
import { IoAdd } from 'react-icons/io5'
import { FiCalendar } from 'react-icons/fi'

export type CalendarMode = 'meditation' | 'sport' | 'water' | 'sleep' | 'general'

interface Session {
  id: number
  telegram_id: number
  date: string
  exercise_type?: string
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
  amount?: number
  time_of_day?: string
  sleep_start?: string
  sleep_end?: string
  quality?: number
  deep_sleep_duration?: number
  notes?: string
}

interface UniversalCalendarGridProps {
  currentDate: Date
  sessions: Session[]
  mode: CalendarMode
  onAddNow?: () => void
  onAddWithDate?: () => void
}

export function UniversalCalendarGrid({ 
  currentDate, 
  sessions, 
  mode,
  onAddNow,
  onAddWithDate 
}: UniversalCalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const renderSportSession = (daySessions: Session[]) => {
    if (!daySessions.length) return null
    const session = daySessions[0]
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <GiMuscleUp className={`w-5 h-5 ${
          session.intensity === 'high' ? 'text-emerald-400' :
          session.intensity === 'medium' ? 'text-emerald-300' :
          'text-emerald-200'
        }`} />
        <span className="text-[10px] text-white/70 mt-1">{session.duration}м</span>
      </div>
    )
  }

  const renderWaterProgress = (daySessions: Session[]) => {
    const totalAmount = daySessions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const percentage = Math.min((totalAmount / 3000) * 100, 100) // Цель - 3 литра
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Фон */}
          <div className="absolute inset-0 bg-[#2A2A2A] rounded-xl" />
          
          {/* Жидкость */}
          <motion.div
            initial={{ height: '0%' }}
            animate={{ height: `${percentage}%` }}
            className="absolute inset-x-0 bottom-0 rounded-xl bg-gradient-to-t from-blue-400/30 to-blue-300/30 overflow-hidden"
            style={{ 
              transformOrigin: 'bottom',
              transition: 'height 1s ease-out'
            }}
          >
            {/* Волны */}
            <motion.div
              className="absolute inset-0 opacity-50"
              style={{
                background: 'radial-gradient(circle at center, rgba(147,197,253,0.3) 0%, transparent 100%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                y: ['-10%', '10%', '-10%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(147,197,253,0.2) 0%, transparent 100%)',
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                y: ['10%', '-10%', '10%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Количество литров */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-medium text-[#E8D9C5]">
                {(totalAmount / 1000).toFixed(1)}
              </span>
              <span className="text-xs text-[#E8D9C5]/60 ml-1">л</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSleepSession = (daySessions: Session[]) => {
    if (!daySessions.length) return null
    const session = daySessions[0]
    const sleepStart = new Date(session.sleep_start!)
    const sleepEnd = new Date(session.sleep_end!)
    const duration = (sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60 * 60)

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <BsMoonStars className={`w-5 h-5 ${
          session.quality === 5 ? 'text-purple-400' :
          session.quality === 4 ? 'text-purple-300' :
          'text-purple-200'
        }`} />
        <span className="text-[10px] text-white/70 mt-1">{duration.toFixed(1)}ч</span>
      </div>
    )
  }

  const renderGeneralSession = (daySessions: Session[]) => {
    const hasSport = daySessions.some(s => s.exercise_type)
    const hasWater = daySessions.some(s => s.amount)
    const hasSleep = daySessions.some(s => s.sleep_start)

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
        {hasSport && <GiMuscleUp className="w-4 h-4 text-emerald-300" />}
        {hasWater && <RiWaterFlashLine className="w-4 h-4 text-blue-300" />}
        {hasSleep && <BsMoonStars className="w-4 h-4 text-purple-300" />}
      </div>
    )
  }

  const renderDayContent = (day: Date) => {
    const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day))
    if (!daySessions.length) return null

    switch (mode) {
      case 'sport':
        return renderSportSession(daySessions)
      case 'water':
        return renderWaterProgress(daySessions)
      case 'sleep':
        return renderSleepSession(daySessions)
      case 'general':
        return renderGeneralSession(daySessions)
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Кнопки добавления */}
      {mode !== 'general' && (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddNow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 transition-colors"
          >
            <IoAdd className="w-5 h-5" />
            <span>Добавить сейчас</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddWithDate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 transition-colors"
          >
            <FiCalendar className="w-5 h-5" />
            <span>Выбрать дату</span>
          </motion.button>
        </div>
      )}

      {/* Календарь */}
      <div className="w-full">
        <div className="grid grid-cols-7 gap-2.5 sm:gap-4 mb-2.5 sm:mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className="text-sm text-[#E8D9C5]/60">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2.5 sm:gap-4">
          {days.map((day, i) => (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`relative aspect-square rounded-xl bg-[#2A2A2A]/80 backdrop-blur-xl 
                border border-[#333333] overflow-hidden group hover:border-[#E8D9C5]/20 transition-colors
                ${isSameDay(day, new Date()) ? 'ring-2 ring-[#E8D9C5]/20' : ''}`}
            >
              <div className="absolute top-1.5 left-1.5">
                <span className="text-xs text-[#E8D9C5]/40">
                  {format(day, 'd')}
                </span>
              </div>
              {renderDayContent(day)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 