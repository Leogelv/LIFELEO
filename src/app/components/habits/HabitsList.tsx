'use client'

import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { UserIdContext } from '@/contexts/UserIdContext'
import { HabitCard } from './HabitCard'
import { EditHabitModal } from './EditHabitModal'
import { type HabitCategory } from './config/categoryConfig'
import { habitsRealtime } from '@/utils/habits-realtime'
import { LogsWorker } from './LogsWorker'

interface Habit {
  id: string
  name: string
  category: HabitCategory
  target_value: number
  telegram_id: number
  created_at: string
  active: boolean
}

interface HabitLog {
  id: string
  habit_id: string
  value: number
  completed_at: string
  created_at: string
}

export default function HabitsList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userId = useContext(UserIdContext)

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        logger.debug('Начинаем загрузку привычек', { userId })
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('telegram_id', userId)

        if (error) throw error

        logger.info('Привычки успешно загружены', { count: data?.length })
        setHabits(data || [])
      } catch (error) {
        logger.error('Неожиданная ошибка при загрузке привычек', { error })
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }

    let unsubscribe: (() => void) | undefined

    if (userId) {
      fetchHabits()
      
      // Подписываемся на изменения через habitsRealtime менеджер
      unsubscribe = habitsRealtime.subscribe(`habits-${userId}`, (payload) => {
        // Проверяем что это наша привычка
        const isOurHabit = (
          (payload.new && 'telegram_id' in payload.new && payload.new.telegram_id === userId) ||
          (payload.old && 'telegram_id' in payload.old && payload.old.telegram_id === userId)
        )

        if (!isOurHabit) return

        logger.info('🔄 Realtime: Получено изменение в привычках', { 
          eventType: payload.eventType,
          habit: payload.new && 'name' in payload.new ? payload.new.name : 
                 payload.old && 'name' in payload.old ? payload.old.name : 'unknown',
          id: payload.new && 'id' in payload.new ? payload.new.id : 
              payload.old && 'id' in payload.old ? payload.old.id : 'unknown'
        })
        
        try {
          if (payload.eventType === 'INSERT' && payload.new && 'name' in payload.new) {
            logger.debug('📥 Добавляем новую привычку', payload.new)
            setHabits(current => [...current, payload.new as Habit])
          } 
          else if (payload.eventType === 'DELETE' && payload.old && 'id' in payload.old) {
            logger.debug('🗑️ Удаляем привычку', payload.old)
            setHabits(current => current.filter(h => h.id !== payload.old.id))
          } 
          else if (payload.eventType === 'UPDATE' && payload.new && 'id' in payload.new) {
            logger.debug('✏️ Обновляем привычку', payload.new)
            setHabits(current => 
              current.map(h => h.id === payload.new.id ? payload.new as Habit : h)
            )
          }
        } catch (error) {
          logger.error('🔄 Ошибка при обработке realtime события:', error)
        }
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId])

  const handleEdit = (habit: Habit) => {
    setSelectedHabit(habit)
  }

  const handleSave = (updatedHabit: Habit) => {
    setHabits(current =>
      current.map(habit =>
        habit.id === updatedHabit.id ? updatedHabit : habit
      )
    )
    setSelectedHabit(null)
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        Нет активных привычек
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <LogsWorker />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedHabit && (
          <EditHabitModal
            habit={selectedHabit}
            onClose={() => setSelectedHabit(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 