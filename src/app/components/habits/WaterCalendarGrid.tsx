'use client'

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { motion } from 'framer-motion'

interface WaterSession {
  id: number
  telegram_id: number
  date: string
  amount: number
  time_of_day: string
}

interface WaterCalendarGridProps {
  currentDate: Date
  sessions: WaterSession[]
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function WaterCalendarGrid({ currentDate, sessions }: WaterCalendarGridProps) {
  // Получаем все дни текущего месяца
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }, [currentDate])

  // Получаем сумму воды для конкретного дня
  const getWaterAmount = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const daySessions = sessions.filter(s => s.date === dayStr)
    if (!daySessions.length) return null
    
    const totalAmount = daySessions.reduce((sum, session) => sum + session.amount, 0)
    return totalAmount
  }

  // Получаем день недели (0-6, где 0 - воскресенье)
  const getWeekdayIndex = (date: Date) => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1 // Конвертируем в формат Пн-Вс (0-6)
  }

  // Рендерим воду с волнами
  const renderWater = (amount: number) => {
    const liters = amount / 1000
    const maxLiters = 3 // максимум 3 литра
    const percentage = Math.min((liters / maxLiters) * 100, 100)

    return (
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1
          }}
          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500/40 to-cyan-400/30 backdrop-blur-sm"
        >
          <motion.div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23E8D9C5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '100% 30%',
              backgroundPosition: 'center bottom',
              height: '100%',
              width: '200%',
              left: '-50%'
            }}
            animate={{ 
              x: ["0%", "-50%"]
            }}
            transition={{ 
              duration: 20,
              ease: "linear",
              repeat: Infinity
            }}
          />
          <motion.div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.15' fill='%23E8D9C5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '100% 20%',
              backgroundPosition: 'center bottom',
              height: '100%',
              width: '200%',
              left: '-50%'
            }}
            animate={{ 
              x: ["-50%", "0%"]
            }}
            transition={{ 
              duration: 15,
              ease: "linear",
              repeat: Infinity
            }}
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base md:text-lg font-light text-[#E8D9C5]" suppressHydrationWarning>
            {liters.toFixed(1)}л
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Месяц и год */}
      <h2 className="text-xl font-light text-[#E8D9C5] mb-4 md:mb-8" suppressHydrationWarning>
        {format(currentDate, 'LLLL yyyy', { locale: ru })}
      </h2>

      {/* Сетка дней */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-4">
        {days.map(day => {
          const waterAmount = getWaterAmount(day)
          const isToday = isSameDay(day, new Date())
          const weekdayIndex = getWeekdayIndex(day)

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-square relative"
            >
              <div className={`
                absolute inset-0 rounded-xl backdrop-blur-sm border
                transition-all duration-300
                ${isToday 
                  ? 'bg-[#E8D9C5]/5 border-[#E8D9C5]/20 ring-1 ring-[#E8D9C5]/20' 
                  : 'bg-[#E8D9C5]/[0.02] border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20'
                }
              `}>
                {/* Число */}
                <div className={`
                  absolute top-2 left-2 md:top-3 md:left-3 transition-colors duration-300
                  ${isToday ? 'text-[#E8D9C5]' : 'text-[#E8D9C5]/60'}
                `} suppressHydrationWarning>
                  <span className="text-sm md:text-lg font-light">{format(day, 'd')}</span>
                </div>

                {/* День недели */}
                <div className="absolute top-2 right-2 md:top-3 md:right-3">
                  <span className="text-xs md:text-sm font-light text-[#E8D9C5]/40">
                    {WEEKDAYS[weekdayIndex]}
                  </span>
                </div>

                {/* Вода */}
                {waterAmount && (
                  <div className="absolute inset-0 pt-8 md:pt-12">
                    {renderWater(waterAmount)}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
} 