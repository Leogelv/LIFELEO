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

  // Функция для обработки начала перетаскивания
  const handleDragStart = (task: Todo) => {
    setDraggedTask(task)
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

  // Функция для рендеринга задач для конкретного дня
  const renderTasksForDay = (day: Date) => {
    const dayTasks = todos.filter(todo => 
      isSameDay(new Date(todo.deadline), day)
    )
    
    if (dayTasks.length === 0) return null
    
    return (
      <div className="flex flex-col gap-1 mt-1">
        {dayTasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(task)}
            onDragEnd={(e) => handleDragEnd(e, task)}
            className={`
              text-xs p-1.5 rounded-md cursor-move
              ${task.done 
                ? 'bg-emerald-500/20 text-emerald-300 line-through' 
                : isAfter(new Date(), new Date(task.deadline))
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-[#E8D9C5]/10 text-[#E8D9C5]'
              }
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
              <span className="truncate">{task.name}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#E8D9C5]/10 overflow-hidden">
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
      <div className={`grid grid-cols-7 ${view === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
        {view === 'month' && (
          // Пустые ячейки до начала месяца
          Array.from({ length: new Date(monthStart).getDay() === 0 ? 6 : new Date(monthStart).getDay() - 1 }).map((_, index) => (
            <div 
              key={`empty-start-${index}`} 
              className="border-b border-r border-[#E8D9C5]/5 p-2 min-h-[100px]"
            />
          ))
        )}
        
        {/* Дни месяца/недели */}
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isSelected = isSameDay(day, currentDate)
          const isToday_ = isToday(day)
          const isPast = isBefore(day, new Date()) && !isToday_
          const isHovered = hoveredDate && isSameDay(day, hoveredDate)
          
          return (
            <div 
              key={day.toISOString()}
              onDragOver={(e) => handleDragOver(e, day)}
              onDrop={(e) => handleDrop(e, day)}
              className={`
                relative border-b border-r border-[#E8D9C5]/5 p-2 min-h-[100px]
                transition-colors duration-200
                ${isHovered ? 'bg-[#E8D9C5]/5' : ''}
                ${!isCurrentMonth && view === 'month' ? 'opacity-30' : ''}
              `}
            >
              {/* Индикатор текущего дня */}
              {isToday_ && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
              
              {/* Номер дня */}
              <div className={`
                text-sm font-medium mb-1
                ${isSelected ? 'text-rose-400' : ''}
                ${isToday_ ? 'text-[#E8D9C5]' : ''}
                ${isPast ? 'text-[#E8D9C5]/40' : 'text-[#E8D9C5]/80'}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* Задачи дня */}
              {renderTasksForDay(day)}
            </div>
          )
        })}
        
        {view === 'month' && (
          // Пустые ячейки после конца месяца
          Array.from({ length: 42 - (new Date(monthStart).getDay() === 0 ? 6 : new Date(monthStart).getDay() - 1) - monthDays.length }).map((_, index) => (
            <div 
              key={`empty-end-${index}`} 
              className="border-b border-r border-[#E8D9C5]/5 p-2 min-h-[100px]"
            />
          ))
        )}
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