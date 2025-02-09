'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { MdClose, MdDelete, MdRefresh } from 'react-icons/md'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { MeditationGuide } from './MeditationGuide'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { habitsRealtime } from '@/utils/habits-realtime'
import { logger } from '@/utils/logger'
import { categoryConfig, type HabitCategory } from './config/categoryConfig'

// Дефолтные значения для кнопок по категориям
const defaultButtons = {
  water: [
    { value: 300, label: '+300 мл' },
    { value: 500, label: '+500 мл' }
  ],
  meditation: [
    { value: 10, label: '+10 мин' },
    { value: 30, label: '+30 мин' }
  ],
  sport: [
    { value: 30, label: '+30 мин' },
    { value: 60, label: '+60 мин' }
  ],
  breathing: [
    { value: 5, label: '+5 мин' },
    { value: 10, label: '+10 мин' }
  ]
} as const

interface EditHabitModalProps {
  habit: {
    id: string
    name: string
    category: HabitCategory
    target_value: number
  }
  onClose: () => void
  onSave: (habit: any) => void
}

interface HabitStats {
  weeklyTotal: number
  monthlyTotal: number
  weeklyAverage: number
  monthlyAverage: number
  streak: number
}

interface DailyValue {
  date: string
  value: number
}

export function EditHabitModal({ habit, onClose, onSave }: EditHabitModalProps) {
  const [editedHabit, setEditedHabit] = useState(habit)
  const [stats, setStats] = useState<HabitStats | null>(null)
  const [dailyValues, setDailyValues] = useState<DailyValue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [valueToAdd, setValueToAdd] = useState<number>(0)
  const config = categoryConfig[habit.category]
  const buttons = defaultButtons[habit.category]
  const [statsView, setStatsView] = useState<'week' | 'month'>('week')

  // Загрузка статистики
  useEffect(() => {
    const loadStats = async () => {
      try {
        logger.debug('🚀 Начинаем загрузку статы для привычки:', habit)

        // Получаем данные за последние 30 дней
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        thirtyDaysAgo.setHours(0, 0, 0, 0)

        const today = new Date()
        today.setHours(23, 59, 59, 999)

        console.log('📅 Период:', {
          from: thirtyDaysAgo.toISOString(),
          to: today.toISOString()
        })

        // Получаем все логи за 30 дней
        const { data: logs, error } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', habit.id)
          .gte('completed_at', thirtyDaysAgo.toISOString())
          .lte('completed_at', today.toISOString())
          .order('completed_at', { ascending: true })

        console.log('📊 Получены логи:', logs)
        console.log('❌ Ошибки если есть:', error)

        if (error) throw error

        if (!logs || logs.length === 0) {
          console.log('⚠️ Нет данных за период')
          setStats({
            weeklyTotal: 0,
            monthlyTotal: 0,
            weeklyAverage: 0,
            monthlyAverage: 0,
            streak: 0
          })
          setDailyValues([])
          return
        }

        // Группируем данные по дням
        const dailyData = logs.reduce((acc: { [key: string]: number }, log) => {
          const date = log.completed_at.split('T')[0]
          acc[date] = (acc[date] || 0) + log.value
          return acc
        }, {})

        console.log('📅 Данные по дням:', dailyData)

        // Заполняем массив за последние 30 дней
        const values: DailyValue[] = []
        for (let i = 29; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
          values.push({
            date,
            value: dailyData[date] || 0
          })
        }

        console.log('📈 Массив значений:', values)

        // Считаем статистику
        const weeklyValues = values.slice(-7)
        const monthlyValues = values

        console.log('📊 Значения за неделю:', weeklyValues)
        console.log('📊 Значения за месяц:', monthlyValues)

        // Считаем серию (дни подряд, где значение >= целевого)
        let currentStreak = 0
        for (let i = values.length - 1; i >= 0; i--) {
          if (values[i].value >= habit.target_value) {
            currentStreak++
          } else {
            break
          }
        }

        const stats = {
          weeklyTotal: weeklyValues.reduce((sum, day) => sum + day.value, 0),
          monthlyTotal: monthlyValues.reduce((sum, day) => sum + day.value, 0),
          weeklyAverage: weeklyValues.reduce((sum, day) => sum + day.value, 0) / 7,
          monthlyAverage: monthlyValues.reduce((sum, day) => sum + day.value, 0) / 30,
          streak: currentStreak
        }

        console.log('🎯 Итоговая статистика:', stats)

        setDailyValues(values)
        setStats(stats)

      } catch (error) {
        logger.error('🔥 Ошибка при загрузке статистики:', error)
        toast.error('Не удалось загрузить статистику')
      }
    }

    loadStats()

    // Подписываемся на изменения в логах привычки через habitsRealtime
    const unsubscribe = habitsRealtime.subscribe(`habit-${habit.id}`, (payload) => {
      // Проверяем что это наша привычка или её лог
      const isOurHabit = (
        (payload.new && (
          ('id' in payload.new && payload.new.id === habit.id) || 
          ('habit_id' in payload.new && payload.new.habit_id === habit.id)
        )) ||
        (payload.old && (
          ('id' in payload.old && payload.old.id === habit.id) ||
          ('habit_id' in payload.old && payload.old.habit_id === habit.id)
        ))
      )

      if (!isOurHabit) return

      logger.info('🔄 Realtime: Получено изменение в привычке или логах', { 
        table: payload.table,
        eventType: payload.eventType,
        habitId: habit.id
      })

      // Перезагружаем статистику при любых изменениях
      loadStats()
    })

    return () => {
      unsubscribe()
    }
  }, [habit.id, habit.target_value])

  // Сброс прогресса за сегодня
  const handleResetToday = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)
        .gte('completed_at', today.toISOString())

      if (error) throw error

      toast.success('Прогресс за сегодня сброшен')
    } catch (error) {
      logger.error('Ошибка при сбросе прогресса', error)
      toast.error('Не удалось сбросить прогресс')
    }
  }

  // Полный сброс прогресса
  const handleDeleteProgress = async () => {
    try {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)

      if (error) throw error

      toast.success('Весь прогресс сброшен')
    } catch (error) {
      logger.error('Ошибка при удалении прогресса', error)
      toast.error('Не удалось удалить прогресс')
    }
  }

  // Сохранение изменений
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          name: editedHabit.name,
          target_value: editedHabit.target_value
        })
        .eq('id', habit.id)

      if (error) throw error

      onSave(editedHabit)
      toast.success('Изменения сохранены')
    } catch (error) {
      logger.error('Ошибка при сохранении', error)
      toast.error('Не удалось сохранить изменения')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg p-6 bg-zinc-900 rounded-2xl shadow-xl space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Редактировать привычку</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Название */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Название</label>
          <input
            type="text"
            value={editedHabit.name}
            onChange={e => setEditedHabit({ ...editedHabit, name: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
              text-white focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Целевое значение */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">
            Целевое значение ({config.unit})
          </label>
          <input
            type="number"
            value={editedHabit.target_value}
            onChange={e => setEditedHabit({ ...editedHabit, target_value: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
              text-white focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Быстрые кнопки */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Быстрые действия</label>
          <div className="flex flex-wrap gap-2">
            {buttons.map((btn, index) => (
              <button
                key={index}
                className={`
                  px-4 py-2 rounded-xl bg-white/10 
                  text-${config.text} hover:bg-white/20 
                  transition-colors
                `}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Статистика с графиком */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium">Статистика</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setStatsView('week')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statsView === 'week' ? 'bg-white/20' : 'bg-white/5'
                }`}
              >
                Неделя
              </button>
              <button
                onClick={() => setStatsView('month')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statsView === 'month' ? 'bg-white/20' : 'bg-white/5'
                }`}
              >
                Месяц
              </button>
            </div>
          </div>

          {/* Основные показатели */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-sm opacity-60 mb-1">
                {statsView === 'week' ? 'За неделю' : 'За месяц'}
              </div>
              <div className="text-2xl font-medium">
                {statsView === 'week' 
                  ? stats?.weeklyTotal || 0 
                  : stats?.monthlyTotal || 0} {config.unit}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-sm opacity-60 mb-1">В среднем в день</div>
              <div className="text-2xl font-medium">
                {Math.round(statsView === 'week' 
                  ? (stats?.weeklyAverage || 0)
                  : (stats?.monthlyAverage || 0))} {config.unit}
              </div>
            </div>
          </div>

          {/* График */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="h-48 relative flex items-end gap-1">
              {(statsView === 'week' ? dailyValues.slice(-7) : dailyValues).map((day, i) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col justify-end h-full group"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${Math.min(100, (day.value / habit.target_value) * 100)}%`
                    }}
                    className={`w-full bg-gradient-to-t ${config.gradient} rounded-t-lg min-h-[4px]`}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 
                    bg-zinc-800 rounded text-xs opacity-0 group-hover:opacity-100 
                    transition-opacity whitespace-nowrap z-10"
                  >
                    {format(new Date(day.date), 'd MMM', { locale: ru })}: {day.value} {config.unit}
                  </div>
                  <div className="text-xs text-white/40 text-center mt-2">
                    {format(new Date(day.date), 'dd.MM')}
                  </div>
                </div>
              ))}

              {/* Целевая линия */}
              <div className="absolute inset-x-0 border-t border-white/20 border-dashed"
                style={{ bottom: '100%' }}
              >
                <div className="absolute right-0 top-0 transform translate-y-[-50%] px-2 py-0.5 
                  bg-zinc-800 rounded text-xs whitespace-nowrap"
                >
                  Цель: {habit.target_value} {config.unit}
                </div>
              </div>
            </div>
          </div>

          {/* Текущая серия */}
          <div className="p-4 rounded-xl bg-white/5 mt-4">
            <div className="text-sm opacity-60 mb-1">Текущая серия</div>
            <div className="text-2xl font-medium">
              {stats?.streak || 0} {stats?.streak === 1 ? 'день' : 'дней'}
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleDeleteProgress}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 
              text-red-400 transition-colors"
          >
            Сбросить прогресс
          </button>
          <button
            onClick={handleResetToday}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
              text-white transition-colors"
          >
            Сбросить сегодня
          </button>
        </div>

        {/* Кнопка сохранения */}
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
            text-white font-medium transition-colors"
        >
          Сохранить
        </button>
      </motion.div>
    </motion.div>
  )
} 