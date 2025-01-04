'use client'

import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { DraggableTask } from './DraggableTask'
import { Icon } from '@iconify/react'

export type CalendarMode = 'sport' | 'water' | 'sleep' | 'tasks'

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

interface Todo {
  id: string
  name: string
  done: boolean
  deadline: string
  telegram_id: number
}

interface UniversalCalendarGridProps {
  currentDate: Date
  sessions: Session[]
  todos?: Todo[]
  mode: CalendarMode
  onAddNow?: () => void
  onAddWithDate?: () => void
  onTaskMove?: (taskId: string, newDate: Date) => void
  onMonthChange?: (date: Date) => void
}

export function UniversalCalendarGrid({ 
  currentDate, 
  sessions, 
  todos = [],
  mode,
  onAddNow,
  onAddWithDate,
  onTaskMove,
  onMonthChange
}: UniversalCalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Рендер спортивной сессии
  const renderSportSession = (daySessions: Session[]) => {
    if (!daySessions.length) return null
    const session = daySessions[0]
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Icon 
          icon="solar:dumbbell-small-outline" 
          className={`w-8 h-8 ${
            session.intensity === 'high' ? 'text-[#E8D9C5]' :
            session.intensity === 'medium' ? 'text-[#E8D9C5]/80' :
            'text-[#E8D9C5]/60'
          }`} 
        />
        <span className="mt-2 text-sm font-light text-[#E8D9C5]/80">
          {session.duration}м
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
      <div className="h-full p-2" style={{ overflow: 'visible' }}>
        <div className="h-full space-y-1" style={{ overflow: 'visible' }}>
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
      </div>
    )
  }

  // Рендер контента дня в зависимости от режима
  const renderDayContent = (day: Date) => {
    if (mode === 'tasks') {
      return renderTasksForDay(day)
    }

    // Преобразуем day в строку в формате YYYY-MM-DD для сравнения
    const dayStr = day.toISOString().split('T')[0]
    
    // Debug: показываем все сессии при первом рендере
    if (mode === 'water' && day.getDate() === 1) {
      console.log('Все сессии:', sessions)
    }
    
    const daySessions = sessions.filter(s => {
      const matches = s.date === dayStr
      // Debug: показываем сравнение дат для каждой сессии
      if (mode === 'water') {
        console.log(`Сравнение дат для ${dayStr}:`, {
          dayStr,
          sessionDate: s.date,
          matches
        })
      }
      return matches
    })
    
    // Debug: показываем результат фильтрации
    if (mode === 'water' && daySessions.length > 0) {
      console.log(`Найдены сессии для ${dayStr}:`, daySessions)
    }
    
    if (!daySessions.length) return null

    switch (mode) {
      case 'sport':
        return renderSportSession(daySessions)
      case 'water':
        return renderWaterProgress(daySessions)
      case 'sleep':
        return renderSleepSession(daySessions)
      default:
        return null
    }
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
    <div className="w-full space-y-8" style={{ overflow: 'visible' }}>
      <div className="w-full relative" style={{ overflow: 'visible' }}>
        {/* Навигация по месяцам */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onMonthChange?.(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
          >
            <Icon icon="solar:arrow-left-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
          </motion.button>
          
          <h2 className="text-xl font-light text-[#E8D9C5]">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h2>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onMonthChange?.(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
          >
            <Icon icon="solar:arrow-right-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
          </motion.button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт'].map(day => (
            <div key={day} className="h-12 flex items-center justify-center">
              <span className="text-lg font-light text-[#E8D9C5]/60">{day}</span>
            </div>
          ))}
        </div>

        {/* Сетка дней */}
        <motion.div 
          key={currentDate.toISOString()}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="grid grid-cols-4 gap-4" 
          style={{ overflow: 'visible' }}
        >
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date())
            return (
              <motion.div
                key={day.toISOString()}
                data-calendar-day={day.toISOString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="aspect-square relative"
                style={{ overflow: 'visible' }}
              >
                <div className={`
                  absolute inset-0 rounded-2xl backdrop-blur-sm border
                  transition-all duration-300
                  ${isToday 
                    ? 'bg-[#E8D9C5]/5 border-[#E8D9C5]/20 ring-1 ring-[#E8D9C5]/20' 
                    : 'bg-[#E8D9C5]/[0.02] border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20'
                  }
                `} style={{ overflow: 'visible' }}>
                  {/* Число */}
                  <div className={`
                    absolute top-3 left-3 transition-colors duration-300
                    ${isToday ? 'text-[#E8D9C5]' : 'text-[#E8D9C5]/60'}
                  `}>
                    <span className="text-lg font-light">{format(day, 'd')}</span>
                  </div>

                  {/* Контент */}
                  <div className="absolute inset-0 pt-12" style={{ overflow: 'visible' }}>
                    {renderDayContent(day)}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
} 