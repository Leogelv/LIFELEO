'use client'

import { useState } from 'react'
import { MdOutlineTaskAlt, MdOutlineCalendarToday, MdArrowBack } from 'react-icons/md'
import { IoTimeOutline } from 'react-icons/io5'
import TodoList from '@/app/components/TodoList'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { UserIdContext } from '@/app/contexts/UserContext'
import { useContext } from 'react'
import { addHours, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { motion, AnimatePresence } from 'framer-motion'

interface Todo {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
}

export default function TasksPage() {
  const [newTask, setNewTask] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [deadline, setDeadline] = useState(() => {
    const date = new Date()
    date.setMinutes(date.getMinutes() + 30)
    return date
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const userId = useContext(UserIdContext)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Оптимистичное обновление UI
      const optimisticTodo = {
        id: 'temp-' + Date.now(),
        name: newTask.trim(),
        done: false,
        deadline: deadline.toISOString(),
        telegram_id: userId,
        created_at: new Date().toISOString()
      }
      setTodos(prev => [...prev, optimisticTodo])

      const { error } = await supabase
        .from('todos')
        .insert([{
          name: newTask.trim(),
          done: false,
          deadline: deadline.toISOString(),
          telegram_id: userId
        }])

      if (error) {
        // Откатываем оптимистичное обновление
        setTodos(prev => prev.filter(t => t.id !== optimisticTodo.id))
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

  const handleTaskMove = async (taskId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ deadline: newDate.toISOString() })
        .eq('id', taskId)
        .eq('telegram_id', userId)

      if (error) {
        console.error('Error moving task:', error)
        toast.error('Не удалось перенести задачу')
      } else {
        toast.success('Задача перенесена')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-gradient-slow" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-pink-500/5 animate-gradient-slow-reverse" 
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
                  bg-white/5 hover:bg-white/10 transition-colors"
              >
                <MdArrowBack className="w-6 h-6" />
                <span>Назад</span>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                Трекер задач
              </h1>
            </motion.div>
            <div className="w-[88px]" />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Add Task Form */}
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleAddTask} 
            className="relative space-y-4"
          >
            <div className="relative group">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Добавить новую задачу..."
                disabled={isSubmitting}
                className="w-full px-8 py-6 bg-white/5 backdrop-blur-lg border border-white/10 
                  rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400/50
                  text-lg text-white placeholder-white/40 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-4">
              {/* Селектор даты в стиле телеги */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex-1 px-8 py-6 bg-white/5 backdrop-blur-lg border border-white/10 
                  rounded-2xl text-lg text-white transition-all duration-300 text-left
                  hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
                {format(deadline, 'd MMMM yyyy, HH:mm', { locale: ru })}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-6 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl
                  text-lg text-white font-medium transition-all duration-300
                  hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:scale-100 min-w-[160px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Добавляем...</span>
                  </div>
                ) : (
                  'Добавить'
                )}
              </motion.button>
            </div>

            {/* Date Picker Dropdown */}
            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 p-6 bg-[#2A2A2A] 
                    border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl z-50"
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Horizontal Task List */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-medium">Список задач</h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4">
                <TodoList 
                  initialTodos={[]} 
                  onTodosChange={setTodos}
                />
              </div>
            </div>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-medium">Календарь задач</h2>
            <UniversalCalendarGrid
              currentDate={new Date()}
              sessions={[]}
              todos={todos}
              mode="tasks"
              onTaskMove={handleTaskMove}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 