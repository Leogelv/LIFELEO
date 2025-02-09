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

interface EditHabitModalProps {
  habit: {
    id: string
    name: string
    category: string
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

const categoryConfig = {
  water: {
    name: 'Вода',
    icon: 'solar:glass-water-bold',
    gradient: 'from-blue-400/20 to-cyan-400/20',
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    unit: 'мл',
    values: [1000, 1500, 2000, 2500, 3000]
  },
  meditation: {
    name: 'Медитация',
    icon: 'solar:meditation-bold',
    gradient: 'from-purple-400/20 to-fuchsia-400/20',
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    unit: 'мин',
    values: [30, 45, 60, 90, 120]
  },
  sport: {
    name: 'Спорт',
    icon: 'solar:running-round-bold',
    gradient: 'from-emerald-400/20 to-teal-400/20',
    border: 'border-emerald-400/30',
    text: 'text-emerald-400',
    unit: 'мин',
    values: [30, 45, 60, 90, 120]
  },
  breathing: {
    name: 'Дыхание',
    icon: 'solar:breathing-bold',
    gradient: 'from-green-400/20 to-emerald-400/20',
    border: 'border-green-400/30',
    text: 'text-green-400',
    unit: 'мин',
    values: [5, 10, 15, 20, 30]
  }
}

export function EditHabitModal({ habit, onClose, onSave }: EditHabitModalProps) {
  const [editingHabit, setEditingHabit] = useState(habit)
  const [stats, setStats] = useState<HabitStats | null>(null)
  const [dailyValues, setDailyValues] = useState<DailyValue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [valueToAdd, setValueToAdd] = useState<number>(0)
  const config = categoryConfig[habit.category as keyof typeof categoryConfig]
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

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          name: editingHabit.name,
          target_value: editingHabit.target_value
        })
        .eq('id', editingHabit.id)

      if (error) throw error

      onSave(editingHabit)
      toast.success('Привычка обновлена')
    } catch (error) {
      toast.error('Не удалось обновить привычку')
    }
  }

  // Удаление всего прогресса
  const handleDeleteProgress = async () => {
    if (!confirm('Вы уверены, что хотите удалить весь прогресс? Это действие нельзя отменить.')) {
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)

      if (error) throw error

      toast.success('Прогресс удален')
      onClose()
    } catch (error) {
      toast.error('Не удалось удалить прогресс')
    } finally {
      setIsLoading(false)
    }
  }

  // Сброс значений за сегодня
  const handleResetToday = async () => {
    if (!confirm('Сбросить значения за сегодня?')) {
      return
    }

    try {
      setIsLoading(true)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)
        .gte('completed_at', today.toISOString())

      if (error) throw error

      toast.success('Значения за сегодня сброшены')
      onClose()
    } catch (error) {
      toast.error('Не удалось сбросить значения')
    } finally {
      setIsLoading(false)
    }
  }

  // Добавление или вычитание значения
  const handleAddValue = async (value: number) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habit.id,
          value: value,
          completed_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success(value > 0 ? 'Значение добавлено' : 'Значение вычтено')
      onClose()
    } catch (error) {
      toast.error('Не удалось обновить значение')
    } finally {
      setIsLoading(false)
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
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-2xl bg-zinc-900 rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-purple-400">
              <Icon icon="solar:meditation-bold" className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-purple-400">
              {habit.name}
            </h3>
          </div>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6">
          {/* Добавление/вычитание значений */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Быстрые действия</h4>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAddValue(10)}
                className="px-4 py-2 rounded-xl bg-white/10 text-purple-400 hover:bg-white/20"
              >
                +10 мин
              </button>
              <button
                onClick={() => handleAddValue(30)}
                className="px-4 py-2 rounded-xl bg-white/10 text-purple-400 hover:bg-white/20"
              >
                +30 мин
              </button>
              <button
                onClick={() => handleAddValue(-10)}
                className="px-4 py-2 rounded-xl bg-white/10 text-rose-400 hover:bg-white/20"
              >
                -10 мин
              </button>
            </div>
          </div>

          {/* Целевое значение */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Целевое значение</h4>
            <input
              type="number"
              value={editingHabit.target_value}
              onChange={(e) => setEditingHabit({
                ...editingHabit,
                target_value: Number(e.target.value)
              })}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg"
              placeholder={`Целевое значение в ${config.unit}`}
            />
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

          {/* Управление данными */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Управление данными</h4>
            <div className="flex gap-4">
              <button
                onClick={handleResetToday}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MdRefresh className="w-5 h-5" />
                <span>Сбросить сегодня</span>
              </button>
              <button
                onClick={handleDeleteProgress}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
              >
                <MdDelete className="w-5 h-5" />
                <span>Удалить прогресс</span>
              </button>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-6 bg-zinc-900/50 border-t border-white/10">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 