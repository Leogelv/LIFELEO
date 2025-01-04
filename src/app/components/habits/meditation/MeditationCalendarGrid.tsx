'use client'

import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

interface MeditationSession {
  uuid: string
  user_id: string
  date: string
  type: string
  duration: number
  completed: boolean
  created_at: string
}

interface DayStats {
  morning?: MeditationSession
  evening?: MeditationSession
}

interface MeditationCalendarGridProps {
  currentDate: Date
  sessions: MeditationSession[]
}

export function MeditationCalendarGrid({ currentDate, sessions }: MeditationCalendarGridProps) {
  // Получаем все дни текущего месяца
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  // Группируем сессии по дням
  const getDayStats = (date: Date): DayStats => {
    const dayStr = format(date, 'yyyy-MM-dd')
    const daySessions = sessions.filter(s => s.date === dayStr)
    return {
      morning: daySessions.find(s => s.type === 'morning'),
      evening: daySessions.find(s => s.type === 'evening')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-sans font-thin tracking-tight text-purple-400/90">
        {format(currentDate, 'LLLL yyyy', { locale: ru })}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
        {monthDays.map((day, index) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const isToday = isSameDay(day, new Date())
          const daySessions = sessions.filter(s => s.date === dayStr)
          const morningSession = daySessions.find(s => s.type === 'morning')
          const eveningSession = daySessions.find(s => s.type === 'evening')
          const hasSession = daySessions.length > 0
          const isDayComplete = (morningSession?.duration || 0) >= 60

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`
                aspect-square p-2 sm:p-4 rounded-2xl border transition-all duration-300 backdrop-blur-sm
                ${isToday ? 'bg-purple-500/10 border-purple-400/30' : 'border-white/5 hover:bg-white/5'}
                relative overflow-hidden group
              `}
            >
              {/* Фоновый градиент для сегодняшнего дня */}
              {isToday && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-transparent"
                  animate={{
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Эффект духовной энергии - блоб градиент */}
              {hasSession && (
                <>
                  {/* Светящийся блоб */}
                  <motion.div
                    className="absolute inset-4 rounded-full blur-2xl"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(255,255,255,0.15), rgba(167,139,250,0.1))',
                      filter: 'blur(20px)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                      borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%']
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Дополнительное свечение */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)'
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </>
              )}

              {/* Номер дня */}
              <span className={`
                text-lg font-sans font-thin tracking-tight
                ${isToday ? 'text-white' : 'text-white/70'}
              `}>
                {format(day, 'd')}
              </span>

              {/* Иконки сессий */}
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                {/* Утренняя сессия */}
                {morningSession && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center
                      ${(morningSession.duration || 0) >= 60 ? 'bg-yellow-400/20' : 'bg-white/10'}
                    `}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 17.75l4.243-4.243a6 6 0 1 0-8.486 0L12 17.75z"
                        stroke={morningSession.duration >= 60 ? '#FBBF24' : '#ffffff50'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Вечерняя сессия */}
                {eveningSession && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center
                      ${(eveningSession.duration || 0) >= 60 ? 'bg-blue-400/20' : 'bg-white/10'}
                    `}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        stroke={eveningSession.duration >= 60 ? '#60A5FA' : '#ffffff50'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Зеленая точка для успешного дня */}
              {isDayComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400/80"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
} 