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
}

export function UniversalCalendarGrid({ 
  currentDate, 
  sessions, 
  todos = [],
  mode,
  onAddNow,
  onAddWithDate,
  onTaskMove
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
      <div className="flex flex-col items-center justify-center h-full relative">
        {/* Индикатор воды */}
        <div className="absolute inset-0 rounded-lg overflow-hidden bg-gradient-to-b from-[#E8D9C5]/[0.02] to-[#E8D9C5]/[0.05]">
          <div 
            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500/20 to-cyan-500/20 transition-all duration-300"
            style={{ height: `${percentage}%` }}
          >
            <div className="absolute inset-0 animate-wave-slow opacity-50"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='%23E8D9C5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundPosition: '0 bottom',
                backgroundSize: '200px auto'
              }}
            />
          </div>
        </div>
        <span className="relative z-10 text-lg font-light text-[#E8D9C5]">
          {amount.toFixed(1)}л
        </span>
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

    const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day))
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
        {/* Дни недели */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт'].map(day => (
            <div key={day} className="h-12 flex items-center justify-center">
              <span className="text-lg font-light text-[#E8D9C5]/60">{day}</span>
            </div>
          ))}
        </div>

        {/* Сетка дней */}
        <div className="grid grid-cols-4 gap-4" style={{ overflow: 'visible' }}>
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

                  {/* Water visualization */}
                  {mode === 'water' && (() => {
                    const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day))
                    if (!daySessions.length || !daySessions[0].amount) return null
                    
                    return (
                      <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-lg">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ 
                            height: `${Math.min(100, (daySessions[0].amount / 3000) * 100)}%`
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500/50 to-cyan-500/30 backdrop-blur-sm"
                          style={{
                            borderRadius: '8px 8px 0 0',
                            maxHeight: '100%'
                          }}
                        >
                          <div 
                            className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x animate-wave opacity-50"
                            style={{ backgroundSize: '20px 4px' }}
                          />
                        </motion.div>
                        <div className="relative z-10 p-2 text-center">
                          <span className="text-sm font-medium">
                            {(daySessions[0].amount / 1000).toFixed(1)}л
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 