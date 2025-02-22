'use client'

import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HabitsList from '@/app/components/habits/HabitsList'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { MdOutlineWater, MdSportsKabaddi, MdSelfImprovement, MdAir, MdArrowBack } from 'react-icons/md'
import { UserIdContext } from '@/contexts/UserIdContext'
import Link from 'next/link'
import { SafeArea } from '../components/SafeArea'

const habitCategories = [
  { id: 'water', name: 'Пить воду', icon: MdOutlineWater, color: 'from-blue-500 to-blue-700', defaultValue: 2000 },
  { id: 'sport', name: 'Тренировка', icon: MdSportsKabaddi, color: 'from-orange-500 to-orange-700', defaultValue: 60 },
  { id: 'meditation', name: 'Медитация', icon: MdSelfImprovement, color: 'from-purple-500 to-purple-700', defaultValue: 20 },
  { id: 'breathing', name: 'Дыхание', icon: MdAir, color: 'from-green-500 to-green-700', defaultValue: 10 }
]

export default function HabitsPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [targetValue, setTargetValue] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userId = useContext(UserIdContext)

  const handleCreateHabit = async () => {
    if (!selectedCategory) {
      toast.error('Выберите категорию')
      return
    }

    if (targetValue <= 0) {
      toast.error('Укажите целевое значение')
      return
    }

    try {
      setIsSubmitting(true)
      logger.debug('Создаем новую привычку', { 
        category: selectedCategory,
        targetValue
      })

      const { error } = await supabase
        .from('habits')
        .insert({
          telegram_id: userId,
          category: selectedCategory,
          name: habitCategories.find(c => c.id === selectedCategory)?.name,
          target_value: targetValue,
          active: true
        })

      if (error) throw error

      toast.success('Привычка создана!')
      setShowModal(false)
      setSelectedCategory(null)
      setTargetValue(0)

    } catch (error) {
      logger.error('Ошибка при создании привычки', { error })
      toast.error('Не удалось создать привычку')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeArea className="min-h-screen bg-zinc-900 text-white">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex justify-between items-center">
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl 
                bg-white/5 hover:bg-white/10 transition-colors"
            >
              <MdArrowBack className="w-6 h-6" />
              <span>Назад</span>
            </Link>
            <h1 className="text-2xl font-medium">Привычки</h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Добавить привычку
            </button>
          </div>

          <HabitsList />

          <AnimatePresence>
            {showModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => setShowModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-zinc-900 p-6 rounded-xl max-w-sm w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-lg font-medium mb-4">Новая привычка</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm opacity-60 mb-2">
                        Категория
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {habitCategories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setTargetValue(category.defaultValue)
                            }}
                            className={`
                              flex items-center gap-2 p-3 rounded-lg transition-colors
                              ${selectedCategory === category.id 
                                ? `bg-gradient-to-br ${category.color}` 
                                : 'bg-zinc-800 hover:bg-zinc-700'
                              }
                            `}
                          >
                            <category.icon className="w-5 h-5" />
                            <span>{category.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm opacity-60 mb-2">
                        Целевое значение ({selectedCategory === 'water' ? 'мл' : 'мин'})
                      </label>
                      <input
                        type="number"
                        value={targetValue}
                        onChange={e => setTargetValue(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-800 rounded-lg"
                        placeholder="Введите значение"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleCreateHabit}
                        disabled={isSubmitting || !selectedCategory || targetValue <= 0}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Создание...' : 'Создать'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SafeArea>
  )
} 