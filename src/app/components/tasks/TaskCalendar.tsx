'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMonths, subMonths, isSameMonth, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, isBefore, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Icon } from '@iconify/react'
import { Todo } from '@/types/todo'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { useTelegram } from '@/app/hooks/useTelegram'

// Стили для кастомного скроллбара
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(232, 217, 197, 0.3);
    border-radius: 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(232, 217, 197, 0.5);
  }
`;

interface TaskCalendarProps {
  todos: Todo[]
  onTodoUpdate: (updatedTodo: Todo) => void
}

export function TaskCalendar({ todos, onTodoUpdate }: TaskCalendarProps) {
  const { userId } = useTelegram()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedTask, setDraggedTask] = useState<Todo | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<'month' | 'week'>('month')

  // Получаем дни для текущего месяца
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Получаем дни для текущей недели
  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Начинаем с понедельника
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // Заканчиваем воскресеньем
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Выбираем дни в зависимости от текущего вида
  const days = view === 'month' ? monthDays : weekDays

  // Функция для перехода к следующему месяцу/неделе
  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 7))
    }
  }

  // Функция для перехода к предыдущему месяцу/неделе
  const goToPrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, -7))
    }
  }

  // Функция для перехода к текущей дате
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Функция для обновления дедлайна задачи
  const updateTaskDeadline = async (taskId: string, newDate: Date) => {
    if (!userId) return
    
    setIsLoading(true)
    
    try {
      // Находим задачу в списке
      const task = todos.find(t => t.id === taskId)
      if (!task) {
        toast.error('Задача не найдена')
        return
      }
      
      // Обновляем дедлайн в базе данных
      const { error } = await supabase
        .from('todos')
        .update({ 
          deadline: newDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('telegram_id', userId)
      
      if (error) {
        throw error
      }
      
      // Обновляем задачу в состоянии
      const updatedTask = { ...task, deadline: newDate.toISOString() }
      onTodoUpdate(updatedTask)
      
      toast.success('Дедлайн задачи обновлен')
      logger.info('Дедлайн задачи обновлен', { taskId, newDate })
    } catch (error) {
      logger.error('Ошибка при обновлении дедлайна', error)
      toast.error('Не удалось обновить дедлайн')
    } finally {
      setIsLoading(false)
      setDraggedTask(null)
      setHoveredDate(null)
    }
  }

  // Функция для переключения статуса выполнения задачи
  const toggleTaskCompletion = async (taskId: string) => {
    if (!userId) return
    
    setIsLoading(true)
    
    try {
      // Находим задачу в списке
      const task = todos.find(t => t.id === taskId)
      if (!task) {
        toast.error('Задача не найдена')
        return
      }
      
      // Обновляем статус в базе данных
      const { error } = await supabase
        .from('todos')
        .update({ 
          done: !task.done,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('telegram_id', userId)
      
      if (error) {
        throw error
      }
      
      // Обновляем задачу в состоянии
      const updatedTask = { ...task, done: !task.done }
      onTodoUpdate(updatedTask)
      
      toast.success(task.done ? 'Задача отмечена как невыполненная' : 'Задача отмечена как выполненная')
      logger.info('Статус задачи обновлен', { taskId, done: !task.done })
    } catch (error) {
      logger.error('Ошибка при обновлении статуса задачи', error)
      toast.error('Не удалось обновить статус задачи')
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для переноса задачи на сегодня +2 часа
  const rescheduleTaskToToday = async (taskId: string) => {
    if (!userId) return
    
    setIsLoading(true)
    
    try {
      // Находим задачу в списке
      const task = todos.find(t => t.id === taskId)
      if (!task) {
        toast.error('Задача не найдена')
        return
      }
      
      // Создаем новую дату (сегодня + 2 часа)
      const newDeadline = new Date()
      newDeadline.setHours(newDeadline.getHours() + 2)
      
      // Обновляем дедлайн в базе данных
      const { error } = await supabase
        .from('todos')
        .update({ 
          deadline: newDeadline.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('telegram_id', userId)
      
      if (error) {
        throw error
      }
      
      // Обновляем задачу в состоянии
      const updatedTask = { ...task, deadline: newDeadline.toISOString() }
      onTodoUpdate(updatedTask)
      
      toast.success('Задача перенесена на сегодня')
      logger.info('Задача перенесена на сегодня', { taskId, newDeadline })
    } catch (error) {
      logger.error('Ошибка при переносе задачи', error)
      toast.error('Не удалось перенести задачу')
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для начала перетаскивания задачи
  const handleDragStart = (e: React.DragEvent, task: Todo) => {
    setDraggedTask(task)
    // Устанавливаем данные для перетаскивания
    e.dataTransfer.setData('text/plain', task.id)
    // Устанавливаем эффект перетаскивания
    e.dataTransfer.effectAllowed = 'move'
  }

  // Функция для обработки окончания перетаскивания
  const handleDragEnd = (e: React.DragEvent, task: Todo) => {
    if (hoveredDate) {
      updateTaskDeadline(task.id, hoveredDate)
    }
    setDraggedTask(null)
    setHoveredDate(null)
  }

  // Функция для обработки перетаскивания над ячейкой
  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    setHoveredDate(date)
  }

  // Функция для обработки сброса перетаскивания
  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (draggedTask) {
      updateTaskDeadline(draggedTask.id, date)
    }
  }

  // Функция для отображения задач в ячейке календаря
  const renderTasks = (day: Date) => {
    // Фильтруем задачи для текущего дня
    const dayTasks = todos.filter(todo => {
      const todoDate = new Date(todo.deadline)
      return isSameDay(todoDate, day)
    })

    return (
      <div className="mt-1 space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
        {dayTasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onClick={() => {}} // Пустой обработчик для предотвращения всплытия
            className={`
              p-1.5 rounded-md text-xs cursor-grab active:cursor-grabbing
              group relative transition-all duration-150
              ${task.done ? 'bg-emerald-400/10 text-emerald-300' : 
                isAfter(new Date(), new Date(task.deadline))
                  ? 'bg-rose-400/10 text-rose-300'
                  : 'bg-[#E8D9C5]/10 text-[#E8D9C5]/90 hover:bg-[#E8D9C5]/15'
              }
              ${draggedTask?.id === task.id ? 'opacity-50' : 'opacity-100'}
              border border-transparent hover:border-[#E8D9C5]/20
            `}
          >
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                task.done 
                  ? 'bg-emerald-400' 
                  : isAfter(new Date(), new Date(task.deadline))
                    ? 'bg-rose-400'
                    : 'bg-[#E8D9C5]/60'
              }`} />
              <span className="truncate max-w-[calc(100%-40px)]" title={task.name}>{task.name}</span>
              
              {/* Кнопки действий - появляются при наведении */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Кнопка выполнения */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleTaskCompletion(task.id);
                  }}
                  className="p-1 rounded-md bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 text-[#E8D9C5]"
                  title={task.done ? "Отметить как невыполненную" : "Отметить как выполненную"}
                >
                  <Icon icon="solar:check-circle-bold" className="w-3 h-3" />
                </button>
                
                {/* Кнопка переноса на сегодня */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    rescheduleTaskToToday(task.id);
                  }}
                  className="p-1 rounded-md bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 text-[#E8D9C5]"
                  title="Перенести на сегодня +2 часа"
                >
                  <Icon icon="solar:calendar-today-bold" className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#E8D9C5]/10 overflow-hidden">
      {/* Добавляем стили для скроллбара */}
      <style jsx global>{customScrollbarStyles}</style>
      
      {/* Заголовок календаря */}
      <div className="p-4 border-b border-[#E8D9C5]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-[#E8D9C5]">
            {view === 'month' 
              ? format(currentDate, 'LLLL yyyy', { locale: ru })
              : `${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM', { locale: ru })}`
            }
          </h2>
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrev}
              className="p-1 rounded-md hover:bg-[#E8D9C5]/5"
            >
              <Icon icon="solar:arrow-left-outline" className="w-5 h-5 text-[#E8D9C5]/70" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToToday}
              className="p-1 rounded-md hover:bg-[#E8D9C5]/5"
            >
              <Icon icon="solar:calendar-today-outline" className="w-5 h-5 text-[#E8D9C5]/70" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="p-1 rounded-md hover:bg-[#E8D9C5]/5"
            >
              <Icon icon="solar:arrow-right-outline" className="w-5 h-5 text-[#E8D9C5]/70" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded-md transition-colors ${
              view === 'week' 
                ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
                : 'bg-transparent text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            Неделя
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded-md transition-colors ${
              view === 'month' 
                ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
                : 'bg-transparent text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            Месяц
          </motion.button>
        </div>
      </div>
      
      {/* Дни недели */}
      <div className="grid grid-cols-7 border-b border-[#E8D9C5]/10">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
          <div 
            key={day} 
            className={`p-2 text-center text-sm font-medium ${
              index >= 5 ? 'text-[#E8D9C5]/40' : 'text-[#E8D9C5]/60'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Сетка календаря */}
      <div className={`grid ${view === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-px bg-[#E8D9C5]/5`}>
        {/* Названия дней недели */}
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
          <div key={day} className="p-2 text-center text-[#E8D9C5]/70 font-medium bg-[#1A1A1A]">
            {day}
          </div>
        ))}
        
        {/* Дни */}
        {days.map((day, i) => {
          // Определяем, является ли день текущим месяцем
          const isCurrentMonth = isSameMonth(day, currentDate)
          // Определяем, является ли день сегодняшним
          const isCurrentDay = isToday(day)
          // Определяем, наведен ли курсор на этот день при перетаскивании
          const isHovered = hoveredDate ? isSameDay(day, hoveredDate) : false
          
          return (
            <div
              key={i}
              className={`
                min-h-[120px] p-2 bg-[#1A1A1A] relative
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isCurrentDay ? 'ring-1 ring-[#E8D9C5]/30 bg-[#E8D9C5]/5' : ''}
                ${isHovered ? 'bg-[#E8D9C5]/10' : ''}
                transition-colors duration-150
              `}
              onDragOver={(e) => {
                e.preventDefault()
                setHoveredDate(day)
              }}
              onDragLeave={() => setHoveredDate(null)}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`
                    inline-flex justify-center items-center w-6 h-6 rounded-full text-sm
                    ${isCurrentDay ? 'bg-[#E8D9C5] text-[#1A1A1A] font-medium' : 'text-[#E8D9C5]/80'}
                  `}
                >
                  {format(day, 'd')}
                </span>
                
                {/* Индикатор количества задач */}
                {todos.filter(todo => isSameDay(new Date(todo.deadline), day)).length > 0 && (
                  <span className="text-xs text-[#E8D9C5]/60">
                    {todos.filter(todo => isSameDay(new Date(todo.deadline), day)).length} задач
                  </span>
                )}
              </div>
              
              {/* Задачи */}
              {renderTasks(day)}
            </div>
          )
        })}
      </div>
      
      {/* Индикатор загрузки */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-t-transparent border-[#E8D9C5] rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 