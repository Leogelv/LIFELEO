'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface TodayCardProps {
  todayStats: {
    totalMinutes?: number
    sessionsCount?: number
    morningMinutes?: number
    eveningMinutes?: number
  }
  onStartMeditation: () => void
}

export function TodayCard({ todayStats, onStartMeditation }: TodayCardProps) {
  const showEvening = todayStats.morningMinutes && todayStats.morningMinutes >= 60

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <motion.div
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
        className="relative overflow-hidden rounded-2xl p-4 sm:p-6 cursor-pointer
          border border-white/5 transition-colors duration-300"
        onClick={onStartMeditation}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-400/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-amber-400/10 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="relative w-10 sm:w-12 h-10 sm:h-12">
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r
                  from-amber-300/40 via-yellow-300/40 to-orange-300/40
                  rounded-full blur-xl"
              />

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r
                  from-amber-400/60 via-yellow-400/60 to-orange-400/60
                  rounded-full blur-lg"
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="relative z-10 w-full h-full"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-amber-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <motion.g
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.8, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42"/>
                    </motion.g>
                  </svg>
                </div>
              </motion.div>

              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0, 0.3, 0],
                    x: [0, (i - 1) * 10],
                    y: [0, (i - 1) * -10]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2
                    bg-yellow-200/40 rounded-full blur-sm"
                  style={{
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <span className="text-sm sm:text-base font-sans font-thin tracking-tight text-white/70">Утро</span>
                {todayStats.morningMinutes && todayStats.morningMinutes >= 60 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20"
                  >
                    <span className="text-xs sm:text-sm font-sans font-thin tracking-tight text-emerald-400">
                      Выполнено
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs sm:text-sm font-sans font-thin text-white/40">
                  {todayStats.morningMinutes || 0}
                </span>
                <span className="text-xs sm:text-sm font-sans font-thin text-white/30">/</span>
                <span className="text-xs sm:text-sm font-sans font-thin text-white/40">60 мин</span>
              </div>
            </div>
          </div>

          <div className="relative space-y-3">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(todayStats.totalMinutes || 0) / 60 * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-orange-400/60
                  relative group"
              >
                <motion.div
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                    width: ['100%', '120%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 bottom-0 left-0
                    bg-gradient-to-r from-transparent via-white/30 to-transparent
                    skew-x-12 -translate-x-full"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {showEvening && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
          className="relative overflow-hidden rounded-2xl p-4 sm:p-6 cursor-pointer
            border border-white/5 transition-colors duration-300"
          onClick={onStartMeditation}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r
                    from-blue-400/20 to-cyan-400/20
                    rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    rotate: [-5, 5, -5]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <svg
                    className="w-8 h-8 text-blue-400/80"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z"/>
                  </svg>
                </motion.div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-end gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base font-sans font-thin tracking-tight text-white/70">Вечер</span>
                  {todayStats.eveningMinutes && todayStats.eveningMinutes >= 60 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20"
                    >
                      <span className="text-xs sm:text-sm font-sans font-thin tracking-tight text-emerald-400">
                        Выполнено
                      </span>
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs sm:text-sm font-sans font-thin text-white/40">
                    {todayStats.eveningMinutes || 0}
                  </span>
                  <span className="text-xs sm:text-sm font-sans font-thin text-white/30">/</span>
                  <span className="text-xs sm:text-sm font-sans font-thin text-white/40">60 мин</span>
                </div>
              </div>
            </div>

            <div className="relative space-y-3">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (todayStats.totalMinutes || 0) - 60) / 60 * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-400/50 to-cyan-400/50"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 