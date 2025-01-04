'use client'

import { useState } from 'react'
import { MdOutlineTaskAlt, MdOutlineCalendarToday, MdArrowBack } from 'react-icons/md'
import { IoTimeOutline } from 'react-icons/io5'
import TodoList from '@/app/components/TodoList'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { UserIdContext } from '@/app/page'
import { useContext } from 'react'
import { addHours, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'

export default function TasksPage() {
  const [newTask, setNewTask] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [deadline, setDeadline] = useState(() => {
    const date = new Date()
    date.setMinutes(date.getMinutes() + 30)
    return date
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userId = useContext(UserIdContext)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Добавляем задачу
      const { error } = await supabase
        .from('todos')
        .insert([
          {
            name: newTask.trim(),
            done: false,
            deadline: deadline.toISOString(),
            telegram_id: userId
          },
        ])

      if (error) {
        console.error('Error adding task:', error)
        toast.error('Не удалось добавить задачу')
      } else {
        setNewTask('')
        // Обновляем дедлайн на +30 минут от текущего времени
        const newDeadline = new Date()
        newDeadline.setMinutes(newDeadline.getMinutes() + 30)
        setDeadline(newDeadline)
        toast.success('Задача добавлена')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-8">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-gradient-slow" />
      <div className="fixed inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-pink-500/5 animate-gradient-slow-reverse" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
              bg-white/5 hover:bg-white/10 transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
            <span>Назад</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Трекер задач
            </h1>
          </div>
          <div className="w-[88px]" /> {/* Для центрирования заголовка */}
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="relative space-y-4">
          <div className="relative group">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Добавить новую задачу..."
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-white/5 backdrop-blur-lg border border-white/10 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50
                text-white placeholder-white/40 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4">
            {/* Селектор даты в стиле телеги */}
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex-1 px-6 py-4 bg-white/5 backdrop-blur-lg border border-white/10 
                rounded-xl text-white transition-all duration-300 text-left
                  hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
              {format(deadline, 'd MMMM yyyy, HH:mm', { locale: ru })}
              </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-4 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl
                text-white font-medium transition-all duration-300
                hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:scale-100 min-w-[120px]"
            >
              {isSubmitting ? 'Добавляем...' : 'Добавить'}
            </button>
          </div>

          {/* Выпадающий календарь в стиле телеги */}
              {showDatePicker && (
            <div className="absolute left-0 right-0 mt-2 p-4 bg-[#2A2A2A] 
              border border-white/10 rounded-xl shadow-xl backdrop-blur-xl z-50"
            >
              <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date()
                        now.setMinutes(now.getMinutes() + 30)
                        setDeadline(now)
                        setShowDatePicker(false)
                      }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl
                    text-white/80 hover:text-white transition-all duration-200
                    flex flex-col items-center"
                    >
                  <span className="text-lg font-medium">Через 30 минут</span>
                  <span className="text-sm text-white/60">
                    {format(addHours(new Date(), 0.5), 'HH:mm', { locale: ru })}
                  </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeadline(addHours(new Date(), 1))
                        setShowDatePicker(false)
                      }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl
                    text-white/80 hover:text-white transition-all duration-200
                    flex flex-col items-center"
                    >
                  <span className="text-lg font-medium">Через 1 час</span>
                  <span className="text-sm text-white/60">
                    {format(addHours(new Date(), 1), 'HH:mm', { locale: ru })}
                  </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeadline(addHours(new Date(), 2))
                        setShowDatePicker(false)
                      }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl
                    text-white/80 hover:text-white transition-all duration-200
                    flex flex-col items-center"
                    >
                  <span className="text-lg font-medium">Через 2 часа</span>
                  <span className="text-sm text-white/60">
                    {format(addHours(new Date(), 2), 'HH:mm', { locale: ru })}
                  </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date()
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        tomorrow.setHours(10, 0, 0)
                        setDeadline(tomorrow)
                        setShowDatePicker(false)
                      }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl
                    text-white/80 hover:text-white transition-all duration-200
                    flex flex-col items-center"
                    >
                  <span className="text-lg font-medium">Завтра</span>
                  <span className="text-sm text-white/60">10:00</span>
                    </button>
                  </div>

              <div className="mt-4">
                <input
                  type="datetime-local"
                  value={deadline.toISOString().slice(0, 16)}
                  onChange={(e) => {
                    setDeadline(new Date(e.target.value))
                    setShowDatePicker(false)
                  }}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl
                    text-white focus:outline-none focus:ring-2 focus:ring-rose-400/50
                    transition-all duration-300"
                />
                </div>
            </div>
          )}
        </form>

        {/* Todo List */}
        <TodoList initialTodos={[]} />
      </div>
    </div>
  )
} 