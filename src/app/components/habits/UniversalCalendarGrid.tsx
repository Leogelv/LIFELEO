'use client'

import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { DraggableTask } from './DraggableTask'
import { Icon } from '@iconify/react'
import { Todo } from '@/types/todo'

export type CalendarMode = 'sport' | 'water' | 'sleep' | 'tasks'
export type CalendarView = 'month' | '3days' | 'week'

interface Session {
  id: number
  telegram_id: number
  date: string
  exercise_type?: string
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
  amount?: number
  sleep_start?: string
  sleep_end?: string
  quality?: number
}

interface UniversalCalendarGridProps {
  currentDate: Date
  todos?: Todo[]
  sessions?: Session[]
  mode: CalendarMode
  view?: CalendarView
  onViewChange?: (view: CalendarView) => void
  onTaskMove?: (taskId: string, newDate: Date) => void
}

export function UniversalCalendarGrid({ 
  currentDate, 
  todos = [], 
  sessions = [],
  mode, 
  view = 'month', 
  onViewChange,
  onTaskMove 
}: UniversalCalendarGridProps) {
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Получаем дни в зависимости от выбранного вида
  const getViewDays = () => {
    switch (view) {
      case '3days':
        return eachDayOfInterval({
          start: new Date(),
          end: addDays(new Date(), 2)
        })
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(new Date(), { locale: ru }),
          end: endOfWeek(new Date(), { locale: ru })
        })
      default:
        return days
    }
  }

  const viewDays = getViewDays()

  // Рендер спортивной сессии
  const renderSportSession = (daySessions: Session[]) => {
    if (!daySessions.length) return null
    
    // Считаем общую длительность всех тренировок
    const totalDuration = daySessions.reduce((acc, session) => acc + (session.duration || 0), 0)
    
    // Определяем максимальную интенсивность
    const maxIntensity = daySessions.reduce((max, session) => {
      const intensityMap = { 'low': 1, 'medium': 2, 'high': 3 }
      const currentIntensity = intensityMap[session.intensity || 'low']
      return currentIntensity > max ? currentIntensity : max
    }, 1)
    
    const intensityClass = maxIntensity === 3 ? 'text-[#E8D9C5]' :
                          maxIntensity === 2 ? 'text-[#E8D9C5]/80' :
                          'text-[#E8D9C5]/60'

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Icon 
          icon="solar:dumbbell-small-outline" 
          className={`w-8 h-8 ${intensityClass}`} 
        />
        <span className="mt-2 text-sm font-light text-[#E8D9C5]/80">
          {totalDuration}м
        </span>
      </div>
    )
  }

  // Рендер водного баланса
  const renderWaterProgress = (daySessions: Session[]) => {
    if (!daySessions.length) return null
    const session = daySessions[0]
    const amount = (session.amount || 0) / 1000
    const maxAmount = 3 // максимум 3 литра
    const percentage = Math.min((amount / maxAmount) * 100, 100)

    return (
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1
          }}
          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500/40 to-cyan-400/30 backdrop-blur-sm"
        >
          <motion.div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23E8D9C5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '100% 30%',
              backgroundPosition: 'center bottom',
              height: '100%',
              width: '200%',
              left: '-50%'
            }}
            animate={{ 
              x: ["0%", "-50%"]
            }}
            transition={{ 
              duration: 20,
              ease: "linear",
              repeat: Infinity
            }}
          />
          <motion.div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.15' fill='%23E8D9C5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '100% 20%',
              backgroundPosition: 'center bottom',
              height: '100%',
              width: '200%',
              left: '-50%'
            }}
            animate={{ 
              x: ["-50%", "0%"]
            }}
            transition={{ 
              duration: 15,
              ease: "linear",
              repeat: Infinity
            }}
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-light text-[#E8D9C5]">
            {amount.toFixed(1)}л
          </span>
        </div>
      </div>
    )
  }

  // Рендер сна
  const renderSleepSession = (daySessions: Session[]) => {
    if (!daySessions.length) return null
    const session = daySessions[0]
    const sleepStart = new Date(session.sleep_start!)
    const sleepEnd = new Date(session.sleep_end!)
    const duration = (sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60 * 60)
    const quality = session.quality || 3

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Icon 
          icon="solar:moon-sleep-outline" 
          className={`w-8 h-8 ${
            quality >= 4 ? 'text-[#E8D9C5]' :
            quality >= 3 ? 'text-[#E8D9C5]/80' :
            'text-[#E8D9C5]/60'
          }`} 
        />
        <span className="mt-2 text-sm font-light text-[#E8D9C5]/80">
          {duration.toFixed(1)}ч
        </span>
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className={`w-1 h-1 rounded-full ${
                i < quality ? 'bg-[#E8D9C5]' : 'bg-[#E8D9C5]/20'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Рендер задач
  const renderTasksForDay = (day: Date) => {
    const dayTasks = todos.filter(todo => isSameDay(new Date(todo.deadline), day))
    if (!dayTasks.length) return null

    return (
      <div className="flex flex-col gap-1 p-2" style={{ overflow: 'visible' }}>
        {dayTasks.map((task) => (
          <DraggableTask 
            key={task.id}
            task={task}
            onMove={onTaskMove!}
            onDrag={(rect) => handleTaskDrag(rect, task.id)}
            onDragEnd={(rect) => handleTaskDragEnd(rect, task.id)}
          />
        ))}
      </div>
    )
  }

  // Рендер контента дня в зависимости от режима
  const renderDayContent = (day: Date) => {
    if (mode === 'tasks') {
      return renderTasksForDay(day)
    }
    return null
  }

  // Функция для определения коллизии между карточкой и ячейкой
  const detectCollision = (cardRect: DOMRect, cellRect: DOMRect) => {
    return !(
      cardRect.right < cellRect.left ||
      cardRect.left > cellRect.right ||
      cardRect.bottom < cellRect.top ||
      cardRect.top > cellRect.bottom
    )
  }

  // Функция для обработки перемещения карточки
  const handleTaskDrag = (taskRect: DOMRect, taskId: string) => {
    const cells = document.querySelectorAll<HTMLElement>('[data-calendar-day]')
    
    Array.from(cells).some(cell => {
      const cellRect = cell.getBoundingClientRect()
      
      if (detectCollision(taskRect, cellRect)) {
        const dateStr = cell.getAttribute('data-calendar-day')
        if (dateStr) {
          const date = new Date(dateStr)
          toast.dismiss()
          toast.info(`${format(date, 'd MMMM', { locale: ru })}`, { duration: 500 })
        }
        return true
      }
      return false
    })
  }

  // Функция для обработки окончания перетаскивания
  const handleTaskDragEnd = (taskRect: DOMRect, taskId: string) => {
    const cells = document.querySelectorAll<HTMLElement>('[data-calendar-day]')
    
    Array.from(cells).some(cell => {
      const cellRect = cell.getBoundingClientRect()
      
      if (detectCollision(taskRect, cellRect)) {
        const dateStr = cell.getAttribute('data-calendar-day')
        if (dateStr) {
          const date = new Date(dateStr)
          onTaskMove?.(taskId, date)
        }
        return true
      }
      return false
    })
  }

  return (
    <div className="space-y-4">
      {/* Переключатель видов */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onViewChange?.('month')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            view === 'month' 
              ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
              : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
          }`}
        >
          Месяц
        </button>
        <button
          onClick={() => onViewChange?.('3days')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            view === '3days' 
              ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
              : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
          }`}
        >
          3 дня
        </button>
        <button
          onClick={() => onViewChange?.('week')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            view === 'week' 
              ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
              : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
          }`}
        >
          Неделя
        </button>
      </div>

      {/* Календарь */}
      <div className="relative">
        <div className="w-full relative" style={{ overflow: 'visible' }}>
          {/* Навигация по месяцам */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
            >
              <Icon icon="solar:arrow-left-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
            </motion.button>
            
            <h2 className="text-xl font-light text-[#E8D9C5]">
              {format(currentDate, 'LLLL yyyy', { locale: ru })}
            </h2>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
            >
              <Icon icon="solar:arrow-right-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
            </motion.button>
          </div>

          {/* Дни недели */}
          <div className="hidden sm:grid grid-cols-7 gap-4 mb-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center">
                <span className="text-sm font-light text-[#E8D9C5]/60">{day}</span>
              </div>
            ))}
          </div>

          {/* Сетка дней */}
          <motion.div 
            key={currentDate.toISOString()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4" 
            style={{ overflow: 'visible' }}
          >
            {viewDays.map((day, i) => {
              const isToday = isSameDay(day, new Date())
              const dayTasks = todos?.filter(todo => isSameDay(new Date(todo.deadline), day)) || []
              const hasContent = dayTasks.length > 0

              return (
                <motion.div
                  key={day.toISOString()}
                  data-calendar-day={day.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`
                    min-h-[120px] w-full rounded-2xl backdrop-blur-sm border
                    transition-all duration-300 flex flex-col
                    ${hasContent ? 'h-auto' : ''}
                    ${isToday 
                      ? 'bg-[#E8D9C5]/5 border-[#E8D9C5]/20 ring-1 ring-[#E8D9C5]/20' 
                      : 'bg-[#E8D9C5]/[0.02] border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20'
                    }
                  `}
                  style={{ overflow: 'visible' }}
                >
                  {/* Число */}
                  <div className={`
                    p-3 flex items-center gap-2
                    ${isToday ? 'text-[#E8D9C5]' : 'text-[#E8D9C5]/60'}
                  `}>
                    <span className="text-lg font-light">{format(day, 'd')}</span>
                    <span className="text-sm font-light sm:hidden">{format(day, 'EEEE', { locale: ru })}</span>
                  </div>

                  {/* Контент */}
                  <div className="flex-1 w-full" style={{ overflow: 'visible' }}>
                    {renderDayContent(day)}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 