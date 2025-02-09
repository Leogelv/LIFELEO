'use client'

import { useState, useEffect } from 'react'
import { MdOutlineTaskAlt, MdOutlineCalendarToday, MdArrowBack, MdOutlineRepeat, MdViewDay, MdViewModule } from 'react-icons/md'
import { IoTimeOutline } from 'react-icons/io5'
import TodoList from '@/app/components/TodoList'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { UserIdContext, UserIdProvider } from '@/app/contexts/UserContext'
import { useContext } from 'react'
import { addHours, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram } from '@/app/hooks/useTelegram'
import { logger } from '@/utils/logger'
import { Icon } from '@/app/components/Icon'

interface Todo {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
  is_habit: boolean
  category?: string
  tags?: string[]
  notes?: string
  target_value?: number
  repeat_type?: 'daily' | 'weekly'
  repeat_ends?: string
}

const categories = [
  { id: 'work', name: 'Работа', icon: 'solar:laptop-bold', color: 'rose' },
  { id: 'home', name: 'Быт', icon: 'solar:home-2-bold', color: 'orange' }
]

export default function TasksPage() {
  const { isExpanded, userId } = useTelegram()
  const defaultUserId = 375634162 // Дефолтный ID для разработки
  const currentUserId = userId || defaultUserId
  const [newTask, setNewTask] = useState('')
  const [comment, setComment] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showRepeatOptions, setShowRepeatOptions] = useState(false)
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | null>('daily')
  const [repeatEnds, setRepeatEnds] = useState<Date | null>(null)
  const [calendarView, setCalendarView] = useState<'month' | '3days' | 'week'>('month')
  const [deadline, setDeadline] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const userIdContext = useContext(UserIdContext)
  const [listView, setListView] = useState<'horizontal' | 'vertical'>('horizontal')
  const [hideCompleted, setHideCompleted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    logger.info('Страница тасков загружена')
  }, [])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      logger.debug('Попытка добавить таск', {
        task: newTask,
        category: selectedCategory,
        tags,
      })

      // Оптимистичное обновление UI
      const optimisticTodo: Todo = {
        id: 'temp-' + Date.now(),
        name: newTask.trim(),
        done: false,
        deadline: new Date().toISOString(),
        telegram_id: currentUserId,
        created_at: new Date().toISOString(),
        is_habit: false,
        category: selectedCategory || undefined,
        tags: tags.length > 0 ? tags : undefined,
        notes: comment.trim() || undefined,
        repeat_type: repeatType || undefined,
        repeat_ends: repeatEnds?.toISOString()
      }
      setTodos(prev => [...prev, optimisticTodo])

      const { error } = await supabase
        .from('todos')
        .insert([{
          name: newTask.trim(),
          done: false,
          deadline: new Date().toISOString(),
          telegram_id: currentUserId,
          is_habit: false,
          category: selectedCategory || undefined,
          tags: tags.length > 0 ? tags : undefined,
          notes: comment.trim() || undefined,
          repeat_type: repeatType || undefined,
          repeat_ends: repeatEnds?.toISOString()
        }])

      if (error) {
        logger.error('Ошибка при добавлении таска', { error })
        // Откатываем оптимистичное обновление
        setTodos(prev => prev.filter(t => t.id !== optimisticTodo.id))
        console.error('Error adding task:', error)
        toast.error('Не удалось добавить задачу')
      } else {
        logger.info('Таск успешно добавлен', { taskName: newTask })
        setNewTask('')
        setComment('')
        setRepeatType('daily')
        setRepeatEnds(null)
        setSelectedCategory('')
        setTags([])
        toast.success('Задача добавлена')
      }
    } catch (error) {
      logger.error('Неожиданная ошибка при добавлении таска', { error })
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    logger.debug('Изменены фильтры', {
      hideCompleted,
      listView
    })
  }, [hideCompleted, listView])

  return (
    <UserIdProvider value={currentUserId}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen relative overflow-hidden ${isExpanded ? 'pt-[100px]' : ''}`}
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  Задачи
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
              className="relative space-y-3"
            >
              <div className="relative group">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Добавить новую задачу..."
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-white/5 backdrop-blur-lg border border-white/10 
                    rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400/50
                    text-base text-white placeholder-white/40 transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {newTask.trim() && (
                <>
                  {/* Заметка */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Добавить заметку..."
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 
                      rounded-xl text-base text-white transition-all duration-300
                      hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400/50
                      min-h-[100px] resize-none"
                  />

                  {/* Категории */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(category => (
                      <motion.button
                        key={category.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-xl transition-colors whitespace-nowrap
                          ${category.id === selectedCategory 
                            ? `bg-${category.color}-400/20 text-${category.color}-400 border border-${category.color}-400/30` 
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }
                        `}
                      >
                        <Icon icon={category.icon} className="w-5 h-5" />
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Дата и время */}
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={format(deadline, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setDeadline(new Date(e.target.value))}
                      className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 
                        rounded-2xl text-base text-white transition-all duration-300
                        hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl
                        text-base text-white font-medium transition-all duration-300
                        hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                        disabled:hover:scale-100"
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
                </>
              )}
            </motion.form>

            {/* Todo List */}
            <TodoList
              initialTodos={todos}
              onTodosChange={setTodos}
              listView={listView}
              hideCompleted={hideCompleted}
            />

            {/* Кнопка показа календаря */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 
                  border border-white/10 hover:border-rose-400/30 transition-all duration-300"
              >
                <Icon icon={showCalendar ? "solar:calendar-minimalistic-bold" : "solar:calendar-add-bold"} className="w-5 h-5" />
                <span>{showCalendar ? 'Скрыть календарь' : 'Показать календарь'}</span>
              </motion.button>
            </motion.div>

            {/* Календарь */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 overflow-hidden"
                >
                  <UniversalCalendarGrid 
                    currentDate={new Date()}
                    todos={todos}
                    mode="tasks"
                    view={calendarView}
                    onViewChange={setCalendarView}
                    onTaskMove={async (taskId: string, newDate: Date) => {
                      const { error } = await supabase
                        .from('todos')
                        .update({ deadline: newDate.toISOString() })
                        .eq('id', taskId)
                        .eq('telegram_id', userId)

                      if (error) {
                        toast.error('Не удалось обновить дедлайн')
                        return
                      }

                      setTodos(current => 
                        current.map(todo => 
                          todo.id === taskId 
                            ? { ...todo, deadline: newDate.toISOString() } 
                            : todo
                        )
                      )
                      toast.success('Дедлайн обновлен')
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </UserIdProvider>
  )
} 