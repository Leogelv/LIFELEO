import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

type CalendarMode = 'meditation' | 'sport' | 'water' | 'general'

interface Session {
  uuid: string
  user_id: string
  date: string
  type?: string
  duration?: number
  completed: boolean
  water_amount?: number
  sleep_time?: string
  wake_time?: string
}

interface UniversalCalendarGridProps {
  currentDate: Date
  sessions: Session[]
  mode: CalendarMode
}

export function UniversalCalendarGrid({ currentDate, sessions, mode }: UniversalCalendarGridProps) {
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  const renderWaterProgress = (amount: number) => {
    const percentage = Math.min((amount / 3) * 100, 100)
    return (
      <motion.div 
        className="absolute inset-x-0 bottom-0 bg-blue-400/30 rounded-b-2xl"
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            y: ['-5%', '5%', '-5%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'linear-gradient(180deg, rgba(96,165,250,0.2) 0%, rgba(96,165,250,0.4) 100%)'
          }}
        />
      </motion.div>
    )
  }

  const renderIcons = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const daySessions = sessions.filter(s => s.date === dayStr)

    switch (mode) {
      case 'meditation':
        return (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {daySessions.map((session, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${(session.duration || 0) >= 60 ? 
                    session.type === 'morning' ? 'bg-yellow-400/20' : 'bg-blue-400/20' 
                    : 'bg-white/10'}`}
              >
                {session.type === 'morning' ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 17.75l4.243-4.243a6 6 0 1 0-8.486 0L12 17.75z"
                      stroke={session.duration && session.duration >= 60 ? '#FBBF24' : '#ffffff50'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      stroke={session.duration && session.duration >= 60 ? '#60A5FA' : '#ffffff50'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        )

      case 'sport':
        return daySessions.map((session, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute inset-0 flex items-center justify-center
              ${session.completed ? 'text-emerald-400' : 'text-white/50'}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </motion.div>
        ))

      case 'water':
        const totalWater = daySessions.reduce((sum, s) => sum + (s.water_amount || 0), 0)
        return renderWaterProgress(totalWater)

      case 'general':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-between p-2">
            <div className="flex gap-1">
              {daySessions.some(s => s.type === 'meditation') && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full bg-purple-400/20 flex items-center justify-center"
                >
                  <span className="text-[10px]">🧘</span>
                </motion.div>
              )}
              {daySessions.some(s => s.type === 'sport') && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center"
                >
                  <span className="text-[10px]">💪</span>
                </motion.div>
              )}
              {daySessions.some(s => s.water_amount) && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full bg-blue-400/20 flex items-center justify-center"
                >
                  <span className="text-[10px]">💧</span>
                </motion.div>
              )}
            </div>
            {daySessions[0]?.sleep_time && (
              <div className="text-[10px] text-white/70">
                {daySessions[0].sleep_time}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-sans font-thin tracking-tight text-purple-400/90">
        {format(currentDate, 'LLLL yyyy', { locale: ru })}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
        {monthDays.map((day, index) => {
          const isToday = isSameDay(day, new Date())
          const dayStr = format(day, 'yyyy-MM-dd')
          const daySessions = sessions.filter(s => s.date === dayStr)
          const hasSession = daySessions.length > 0

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
              )}

              {/* Номер дня */}
              <span className={`
                text-lg font-sans font-thin tracking-tight
                ${isToday ? 'text-white' : 'text-white/70'}
              `}>
                {format(day, 'd')}
              </span>

              {/* Иконки и индикаторы в зависимости от режима */}
              {renderIcons(day)}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
} 