'use client'

import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { UserIdContext } from '@/contexts/UserIdContext'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { categoryConfig, type HabitCategory } from './config/categoryConfig'
import { MeditationGuide } from './MeditationGuide'
import { SafeArea } from '@/app/components/SafeArea'

interface HabitStats {
  total_value: number
  completion_rate: number
  current_streak: number
  average_value: number
}

interface Habit {
  id: string
  name: string
  telegram_id: number
  category: HabitCategory
  target_value: number
  created_at: string
  active: boolean
  current_value?: number
  progress?: number
  values_add?: string
  values_del?: string
  measure?: string
}

interface HabitCardProps {
  habit: Habit
  onEdit?: (habit: Habit) => void
}

interface QuickAddButtonProps {
  value: number
  unit: string
  onClick: () => void
  isLoading: boolean
  config: typeof categoryConfig[HabitCategory]
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const [showQuickInput, setShowQuickInput] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showMeditationGuide, setShowMeditationGuide] = useState(false)
  const [stats, setStats] = useState<HabitStats | null>(null)
  const [dailyValues, setDailyValues] = useState<{date: string, value: number}[]>([])
  const [todayProgress, setTodayProgress] = useState(0)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [currentValue, setCurrentValue] = useState(habit.current_value || 0)
  const [isLoading, setIsLoading] = useState(false)
  const userId = useContext(UserIdContext)
  const config = categoryConfig[habit.category]
  const progress = (currentValue / habit.target_value) * 100

  // Получаем значения для кнопок быстрого добавления из привычки или используем дефолтные
  const getDefaultButtonValues = (): number[] => {
    switch(habit.category) {
      case 'water': return [100, 200, 300, 500];
      case 'meditation': return [5, 10, 15, 20];
      case 'sport': return [15, 30, 45, 60];
      case 'breathing': return [3, 5, 7, 10];
      case 'business': return [15, 30, 45, 60];
      default: return [1, 5, 10];
    }
  };
  
  // Используем values_add из привычки или дефолтные значения
  const quickAddValues = habit.values_add 
    ? habit.values_add.split(',').map(Number).filter(n => !isNaN(n))
    : getDefaultButtonValues();
    
  // Используем values_del из привычки или дефолтные значения (половинные от добавления)
  const quickRemoveValues = habit.values_del
    ? habit.values_del.split(',').map(Number).filter(n => !isNaN(n))
    : quickAddValues.map(v => Math.floor(v / 2)).filter(v => v > 0);

  // Единица измерения из привычки или из конфигурации категории
  const measureUnit = habit.measure || config.unit;

  // Загрузка статистики
  const loadStats = async () => {
    try {
      logger.debug('Загружаем статистику привычки', { habitId: habit.id })
      
      // Получаем статистику за 7 и 30 дней
      const { data: weekStats, error: weekError } = await supabase
        .rpc('get_habit_stats', { 
          p_habit_id: habit.id,
          p_days: 7
        })

      const { data: monthStats, error: monthError } = await supabase
        .rpc('get_habit_stats', {
          p_habit_id: habit.id,
          p_days: 30
        })

      if (weekError || monthError) {
        throw weekError || monthError
      }

      // Получаем значения за последние 7 дней для графика
      const today = new Date()
      const dates = Array.from({length: 7}, (_, i) => {
        const date = subDays(today, i)
        return format(date, 'yyyy-MM-dd')
      }).reverse()

      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('completed_at, value')
        .eq('habit_id', habit.id)
        .gte('completed_at', dates[0])
        .order('completed_at', { ascending: true })

      if (logsError) throw logsError

      const values = dates.map(date => {
        const dayLogs = logs?.filter(log => 
          log.completed_at.startsWith(date)
        ) || []
        return {
          date,
          value: dayLogs.reduce((sum, log) => sum + log.value, 0)
        }
      })

      setDailyValues(values)
      setStats({
        total_value: monthStats[0].total_value,
        completion_rate: weekStats[0].completion_rate,
        current_streak: weekStats[0].current_streak,
        average_value: weekStats[0].average_value
      })

    } catch (error) {
      logger.error('Ошибка при загрузке статистики', { error })
      toast.error('Не удалось загрузить статистику')
    }
  }

  // Загрузка прогресса за сегодня
  useEffect(() => {
    const loadTodayProgress = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        
        const { data, error } = await supabase
          .from('habit_logs')
          .select('value')
          .eq('habit_id', habit.id)
          .gte('completed_at', today)
          .lt('completed_at', format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'))

        if (error) throw error

        const total = data?.reduce((sum, log) => sum + log.value, 0) || 0
        setTodayProgress(total)

      } catch (error) {
        logger.error('Ошибка при загрузке прогресса', { error })
      }
    }

    loadTodayProgress()
  }, [habit.id])

  // Загружаем текущее значение за сегодня
  useEffect(() => {
    const loadTodayValue = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('habit_logs')
        .select('value')
        .eq('habit_id', habit.id)
        .gte('completed_at', today.toISOString())

      if (!error && data) {
        const total = data.reduce((sum, log) => sum + log.value, 0)
        setCurrentValue(total)
      }
    }

    loadTodayValue()
  }, [habit.id])

  // Обработка долгого нажатия
  const handleLongPress = () => {
    const timer = setTimeout(() => {
      setShowStats(true)
      loadStats()
    }, 500)
    setLongPressTimer(timer)
  }

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleQuickAdd = async (value: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habit.id,
          value: value,
          completed_at: new Date().toISOString()
        })

      if (error) throw error

      setCurrentValue(prev => prev + value)
      toast.success(`Добавлено ${value} ${measureUnit}`)
    } catch (error) {
      toast.error('Не удалось добавить значение')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickRemove = async (value: number) => {
    setIsLoading(true)
    try {
      // Проверяем, что не уйдем в минус
      if (currentValue < value) {
        toast.error(`Нельзя вычесть больше, чем имеется (${currentValue} ${measureUnit})`)
        setIsLoading(false)
        return
      }

      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habit.id,
          value: -value,  // Отрицательное значение для вычитания
          completed_at: new Date().toISOString()
        })

      if (error) throw error

      setCurrentValue(prev => prev - value)
      toast.success(`Вычтено ${value} ${measureUnit}`)
    } catch (error) {
      toast.error('Не удалось вычесть значение')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          relative overflow-hidden
          rounded-2xl backdrop-blur-xl
          border border-white/10
          transition-all duration-300 ease-out
          hover:scale-[1.02] hover:shadow-lg
          cursor-pointer
          group
          bg-white/5
        `}
        onMouseDown={handleLongPress}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handleLongPress}
        onTouchEnd={handlePressEnd}
        onClick={() => onEdit?.(habit)}
      >
        {/* Эффекты */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-tl from-black/[0.05] to-transparent" />

        {/* Контент */}
        <div className="relative z-10 p-6 space-y-4">
          {/* Заголовок */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-blue-400">
              <Icon icon="mdi:check" className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white flex-1">
              {habit.name}
            </h3>
            {habit.category === 'meditation' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMeditationGuide(true)
                }}
                className="p-2 rounded-xl bg-purple-400/20 text-purple-400 hover:bg-purple-400/30 transition-colors"
              >
                <Icon icon="solar:meditation-bold" className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Прогресс */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white">
                Сегодня: {currentValue} / {habit.target_value} {measureUnit}
              </span>
              <span className="font-medium text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                className={`absolute h-full left-0 rounded-full ${
                  progress >= 100 ? config.bgComplete : config.bg
                }`}
              />
            </div>
          </div>

          {/* Кнопки быстрого добавления */}
          <div className="flex flex-wrap gap-2">
            {quickAddValues.slice(0, 4).map((value, i) => (
              <QuickAddButton
                key={`add-${i}`}
                value={value}
                unit={measureUnit}
                onClick={() => handleQuickAdd(value)}
                isLoading={isLoading}
                config={config}
              />
            ))}
          </div>
          
          {/* Кнопки быстрого вычитания */}
          <div className="flex flex-wrap gap-2 mt-2">
            {quickRemoveValues.slice(0, 3).map((value, i) => (
              <QuickAddButton
                key={`remove-${i}`}
                value={-value}
                unit={measureUnit}
                onClick={() => handleQuickRemove(value)}
                isLoading={isLoading}
                config={config}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Модальное окно статистики */}
      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStats(false)}
          >
            <SafeArea className="w-full max-w-lg">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-6 mx-4"
                onClick={e => e.stopPropagation()}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Статистика</h3>
                    <button
                      onClick={() => setShowStats(false)}
                      className="p-2 rounded-lg hover:bg-white/10"
                    >
                      <Icon icon="solar:close-circle-bold" className="w-6 h-6 text-white/60" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm opacity-60 mb-1">Всего за 30 дней</p>
                      <p className="text-xl font-medium">
                        {Math.round(stats.total_value)} {measureUnit}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm opacity-60 mb-1">Выполнение цели</p>
                      <p className="text-xl font-medium">
                        {Math.round(stats.completion_rate * 100)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-sm opacity-60 mb-1">Текущая серия</p>
                      <p className="text-xl font-medium">{stats.current_streak} дней</p>
                    </div>

                    <div>
                      <p className="text-sm opacity-60 mb-1">В среднем в день</p>
                      <p className="text-xl font-medium">
                        {Math.round(stats.average_value)} {measureUnit}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SafeArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно гайда по медитации */}
      <AnimatePresence>
        {showMeditationGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMeditationGuide(false)}
          >
            <SafeArea className="w-full max-w-2xl">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="mx-4"
                onClick={e => e.stopPropagation()}
              >
                <MeditationGuide 
                  habit={habit} 
                  onClose={() => setShowMeditationGuide(false)} 
                />
              </motion.div>
            </SafeArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function QuickAddButton({ value, unit, onClick, isLoading, config }: QuickAddButtonProps) {
  const isNegative = value < 0
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-xl
        ${isNegative ? 'bg-red-400/20 hover:bg-red-400/30' : 'bg-white/10 hover:bg-white/20'} 
        backdrop-blur-sm
        ${config.text} text-sm font-medium
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isNegative ? value : `+${value}`} {unit}
    </motion.button>
  )
}