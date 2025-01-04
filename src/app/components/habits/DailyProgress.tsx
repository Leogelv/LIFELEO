import { motion } from 'framer-motion'

interface DailyProgressProps {
  totalMinutes: number
  goalMinutes?: number
}

export function DailyProgress({ totalMinutes, goalMinutes = 120 }: DailyProgressProps) {
  const progress = Math.min((totalMinutes / goalMinutes) * 100, 100)
  
  return (
    <div className="w-full p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/50
      hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Сегодняшняя медитация</h3>
        <span className="text-2xl font-light text-purple-400">{totalMinutes} мин</span>
      </div>
      
      <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Блики на прогресс баре */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-400">0 мин</span>
        <span className="text-gray-400">{goalMinutes} мин</span>
      </div>

      {/* Мотивационное сообщение */}
      <div className="mt-4 text-center">
        {progress < 100 ? (
          <p className="text-gray-300">
            Осталось {goalMinutes - totalMinutes} минут до цели 🎯
          </p>
        ) : (
          <p className="text-emerald-400">
            Отлично! Цель на сегодня достигнута! 🎉
          </p>
        )}
      </div>
    </div>
  )
} 