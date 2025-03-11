'use client'

import { useState, useEffect } from 'react'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import { HabitCard } from '../components/habits/HabitCard'
import { EditHabitModal } from '../components/habits/EditHabitModal'
import { supabase } from '@/utils/supabase/client'
import { useTelegram } from '../hooks/useTelegram'
import { useUserId } from '../contexts/UserIdContext'
import { toast } from 'sonner'
import { habitsRealtime } from '@/utils/habits-realtime'
import { Habit } from '../../types/habit'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export default function HabitsPage() {
  const { userId: telegramUserId } = useTelegram()
  const userId = useUserId()
  const effectiveUserId = userId || telegramUserId
  
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => {
    console.log('🧪 HabitsPage: userId из контекста =', userId);
    console.log('🧪 HabitsPage: userId из telegram =', telegramUserId);
    console.log('🧪 HabitsPage: используем effectiveUserId =', effectiveUserId);
  }, [userId, telegramUserId, effectiveUserId]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Загрузка привычек для userId:', effectiveUserId)
        
        if (!effectiveUserId) {
          console.warn('⚠️ Отсутствует userId, привычки не будут загружены');
          setHabits([]);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('telegram_id', effectiveUserId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching habits:', error)
          toast.error('Не удалось загрузить привычки')
        } else {
          console.log(`✅ Загружено ${data?.length || 0} привычек`)
          setHabits(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHabits()

    // Подписка на изменения в реальном времени
    const unsubscribe = habitsRealtime.subscribe(String(effectiveUserId), (payload) => {
      // Обновляем список привычек только при изменениях в таблице habits
      if (payload.table === 'habits') {
        // Перезагружаем привычки из базы данных
        fetchHabits()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [effectiveUserId])

  const handleAddHabit = () => {
    setEditingHabit(null)
    setShowAddModal(true)
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingHabit(null)
  }

  const handleSaveHabit = (habit: any) => {
    // Обновляем список привычек после сохранения
    const fetchHabits = async () => {
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('telegram_id', effectiveUserId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching habits:', error)
          toast.error('Не удалось загрузить привычки')
        } else {
          setHabits(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Что-то пошло не так')
      }
    }

    fetchHabits()
    setShowAddModal(false)
    setEditingHabit(null)
  }

  // Группировка привычек по категориям
  const habitsByCategory: Record<string, Habit[]> = {}
  habits.forEach(habit => {
    const category = habit.category || 'Без категории'
    if (!habitsByCategory[category]) {
      habitsByCategory[category] = []
    }
    habitsByCategory[category].push(habit)
  })

  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-8">
          {/* Заголовок и кнопка назад */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2A2A]/50 hover:bg-[#2A2A2A] transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-2xl font-bold">Привычки</h1>
            <button
              onClick={handleAddHabit}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2A2A]/50 hover:bg-[#2A2A2A] transition-colors"
            >
              <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
              <span>Новая</span>
            </button>
          </div>

          {/* Список привычек по категориям */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8D9C5]"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(habitsByCategory).map(([category, categoryHabits]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-semibold border-b border-[#E8D9C5]/10 pb-2">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryHabits.map(habit => (
                      <HabitCard 
                        key={habit.id} 
                        habit={habit} 
                        onEdit={() => handleEditHabit(habit)} 
                      />
                    ))}
                  </div>
                </div>
              ))}

              {habits.length === 0 && (
                <div className="text-center py-12 bg-[#2A2A2A]/30 rounded-xl border border-[#E8D9C5]/10">
                  <Icon icon="solar:star-bold" className="w-16 h-16 mx-auto mb-4 text-[#E8D9C5]/30" />
                  <h3 className="text-xl font-semibold mb-2">Нет привычек</h3>
                  <p className="text-[#E8D9C5]/70 mb-6">Создайте свою первую привычку, чтобы начать отслеживать прогресс</p>
                  <button
                    onClick={handleAddHabit}
                    className="px-6 py-3 bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 rounded-lg transition-colors"
                  >
                    Создать привычку
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Модальное окно для добавления/редактирования привычки */}
        {showAddModal && (
          <EditHabitModal
            habit={editingHabit || {
              id: '',
              name: '',
              category: 'water',
              target_value: 0
            }}
            onClose={handleCloseModal}
            onSave={handleSaveHabit}
          />
        )}
      </SafeArea>
      <BottomMenu />
    </>
  )
} 