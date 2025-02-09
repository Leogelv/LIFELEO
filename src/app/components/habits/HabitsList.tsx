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
  const userId = useContext(UserIdContext)

  // Загрузка привычек
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        logger.debug('Начинаем загрузку привычек', { userId })
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('telegram_id', userId)
          .eq('active', true)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Ошибка при загрузке привычек', { error })
          toast.error('Не удалось загрузить привычки')
          return
        }

        logger.info('Привычки успешно загружены', { count: data?.length })
        setHabits(data || [])
      } catch (error) {
        logger.error('Неожиданная ошибка при загрузке привычек', { error })
        toast.error('Что-то пошло не так')
      }
    }

    // Подписка на изменения
    const channel = supabase.channel('habits-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'habits',
          filter: `telegram_id=eq.${userId}`
        },
        (payload) => {
          logger.debug('Получено изменение в привычках', { 
            eventType: payload.eventType,
            newData: payload.new,
            oldData: payload.old
          })

          if (payload.eventType === 'INSERT') {
            setHabits(current => [...current, payload.new as Habit])
          } 
          else if (payload.eventType === 'DELETE') {
            setHabits(current => current.filter(habit => habit.id !== payload.old.id))
          } 
          else if (payload.eventType === 'UPDATE') {
            setHabits(current => 
              current.map(habit => 
                habit.id === payload.new.id ? payload.new as Habit : habit
              )
            )
          }
        }
      )
      .subscribe()

    if (userId) {
      fetchHabits()
    }

    return () => {
      channel.unsubscribe()
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