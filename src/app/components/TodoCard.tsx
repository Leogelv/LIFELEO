'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Icon } from '@iconify/react'
import { MdOutlineCalendarToday, MdCheck, MdOutlineAccessTime, MdDelete, MdOutlineRepeat, MdOutlineNotes, MdOutlineChecklist, MdOutlineToday } from 'react-icons/md'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Todo } from '@/types/todo'

interface TodoCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  listView: 'horizontal' | 'vertical'
}

// Категории с цветами
const categoryColors = {
  water: 'from-blue-500 to-cyan-500',
  sport: 'from-emerald-500 to-teal-500',
  meditation: 'from-purple-500 to-fuchsia-500',
  breathing: 'from-indigo-500 to-blue-500',
  work: 'from-rose-500 to-pink-500',
  home: 'from-orange-500 to-amber-500',
  finance: 'from-emerald-500 to-teal-500'
}

const categoryIcons = {
  water: 'solar:glass-water-bold',
  sport: 'solar:running-round-bold',
  meditation: 'solar:meditation-bold',
  breathing: 'solar:breathing-bold',
  work: 'solar:laptop-bold',
  home: 'solar:home-2-bold',
  finance: 'solar:wallet-money-bold'
}

export function TodoCard({ todo, onToggle, onEdit, onDelete, listView }: TodoCardProps) {
  const [subtasksCount, setSubtasksCount] = useState<number>(0)
  const [completedSubtasksCount, setCompletedSubtasksCount] = useState<number>(0)

  // Загрузка количества подзадач
  useEffect(() => {
    const fetchSubtasks = async () => {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('todo_id', todo.id)

      if (!error && data) {
        setSubtasksCount(data.length)
        setCompletedSubtasksCount(data.filter(s => s.done).length)
      }
    }

    fetchSubtasks()
  }, [todo.id])

  // Функция для быстрого изменения дедлайна
  const quickUpdateDeadline = async (hoursToAdd: number) => {
    const newDeadline = new Date(todo.deadline)
    newDeadline.setHours(newDeadline.getHours() + hoursToAdd)
    
    const { error } = await supabase
      .from('todos')
      .update({ deadline: newDeadline.toISOString() })
      .eq('id', todo.id)

    if (error) {
      toast.error('Не удалось обновить дедлайн')
    }
  }

  // Функция для выполнения и пересоздания задачи
  const completeAndRecreate = async () => {
    // Сначала отмечаем текущую задачу как выполненной
    onToggle(todo.id)

    // Создаем новую задачу на следующий день в то же время
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(new Date(todo.deadline).getHours())
    tomorrow.setMinutes(new Date(todo.deadline).getMinutes())

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todo,
        id: undefined, // Позволяем базе данных создать новый ID
        done: false,
        deadline: tomorrow.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      toast.error('Не удалось создать новую задачу')
    } else {
      toast.success('Задача выполнена и пересоздана на завтра')
    }
  }

  const handleRescheduleToToday = async () => {
    const newDeadline = new Date()
    newDeadline.setHours(newDeadline.getHours() + 2)
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ deadline: newDeadline.toISOString() })
        .eq('id', todo.id)

      if (error) throw error

      onToggle(todo.id)
      toast.success('Задача перенесена на сегодня')
    } catch (error) {
      toast.error('Не удалось перенести задачу')
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        h-full cursor-pointer
        ${listView === 'horizontal' ? 'min-w-[300px] max-w-[350px]' : 'w-full'}
      `}
      onClick={() => onEdit(todo)}
    >
      <div className={`
        relative h-full p-4 rounded-2xl
        bg-gray-900/80 backdrop-blur-xl border border-white/10
        flex flex-col
        hover:bg-gray-900/90 transition-colors
      `}>
        {/* Основной контент */}
        <div className="flex-1 space-y-3">
          {/* Заголовок, статус и категория */}
          <div className="flex items-start gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(todo.id)
              }}
              className={`
                p-2 rounded-xl backdrop-blur-sm shrink-0
                ${todo.done 
                  ? 'bg-emerald-400/20 text-emerald-400' 
                  : 'bg-white/10 text-white hover:bg-white/20'
                }
              `}
            >
              <MdCheck className="w-5 h-5" />
            </motion.button>
            <h3 className="text-lg font-medium text-white flex-1">{todo.name}</h3>
            {todo.category && (
              <span className={`
                px-2 py-1 rounded-lg text-xs shrink-0
                bg-${categoryColors[todo.category as keyof typeof categoryColors]?.split(' ')[0]}/20 
                text-${categoryColors[todo.category as keyof typeof categoryColors]?.split(' ')[0]}-300
              `}>
                {todo.category}
              </span>
            )}
          </div>

          {/* Дедлайн */}
          {todo.deadline && (
            <div className={`
              flex items-center gap-2 text-sm 
              ${new Date(todo.deadline) < new Date() ? 'text-red-400' : 'text-white/60'}
            `}>
              <MdOutlineAccessTime className="w-4 h-4 shrink-0" />
              <span>{format(new Date(todo.deadline), 'dd MMM, HH:mm', { locale: ru })}</span>
            </div>
          )}

          {/* Заметка */}
          {todo.notes && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MdOutlineNotes className="w-4 h-4 shrink-0" />
              <span>Есть заметка</span>
            </div>
          )}

          {/* Подзадачи */}
          {subtasksCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MdOutlineChecklist className="w-4 h-4 shrink-0" />
              <span>{completedSubtasksCount} из {subtasksCount} подзадач</span>
            </div>
          )}

          {/* Повторение */}
          {todo.repeat_type && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MdOutlineRepeat className="w-4 h-4 shrink-0" />
              <span>
                {todo.repeat_type === 'daily' ? 'Ежедневно' : 
                 todo.repeat_type === 'weekly' ? 'Еженедельно' : 
                 'Ежемесячно'}
              </span>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-end gap-2 mt-4" onClick={e => e.stopPropagation()}>
          {/* +1 час */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => quickUpdateDeadline(1)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-1">
              <MdOutlineAccessTime className="w-4 h-4" />
              <span className="text-xs">+1ч</span>
            </div>
          </motion.button>

          {/* +1 день */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => quickUpdateDeadline(24)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-1">
              <MdOutlineCalendarToday className="w-4 h-4" />
              <span className="text-xs">+1д</span>
            </div>
          </motion.button>

          {/* Выполнить и пересоздать */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={completeAndRecreate}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-1">
              <MdOutlineRepeat className="w-4 h-4" />
              <MdCheck className="w-4 h-4" />
            </div>
          </motion.button>

          {/* Перенести на сегодня +2 часа */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRescheduleToToday}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            title="Перенести на сегодня +2 часа"
          >
            <MdOutlineToday className="w-4 h-4" />
          </motion.button>

          {/* Удалить */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(todo.id)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <MdDelete className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
} 