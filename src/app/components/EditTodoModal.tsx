'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addHours, addDays } from 'date-fns'
import { Icon } from '@iconify/react'
import { RichTextEditor } from './RichTextEditor'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'

// Категории
const categories = [
  { id: 'water', name: 'Вода', icon: 'solar:glass-water-bold', color: 'blue' },
  { id: 'sport', name: 'Спорт', icon: 'solar:running-round-bold', color: 'green' },
  { id: 'meditation', name: 'Медитация', icon: 'solar:meditation-bold', color: 'purple' },
  { id: 'work', name: 'Работа', icon: 'solar:laptop-bold', color: 'rose' },
  { id: 'music', name: 'Музыка', icon: 'solar:music-notes-bold', color: 'pink' },
  { id: 'home', name: 'Быт', icon: 'solar:home-2-bold', color: 'orange' },
  { id: 'finance', name: 'Финансы', icon: 'solar:wallet-money-bold', color: 'emerald' }
]

interface Subtask {
  id: string
  todo_id: string
  name: string
  done: boolean
  created_at: string
}

interface Todo {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
  notes?: string
  repeat_type?: 'daily' | 'weekly' | 'monthly'
  repeat_ends?: string
  is_habit: boolean
  category?: string
  tags?: string[]
}

interface EditTodoModalProps {
  todo: Todo | null
  onClose: () => void
  onSave: (todo: Todo) => void
}

export function EditTodoModal({ todo, onClose, onSave }: EditTodoModalProps) {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(todo)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [deadline, setDeadline] = useState<Date | null>(todo?.deadline ? new Date(todo.deadline) : null)

  // Загрузка подзадач
  useEffect(() => {
    if (todo) {
      const fetchSubtasks = async () => {
        const { data, error } = await supabase
          .from('subtasks')
          .select('*')
          .eq('todo_id', todo.id)
          .order('created_at', { ascending: true })

        if (!error && data) {
          setSubtasks(data)
        }
      }
      fetchSubtasks()
    }
  }, [todo])

  if (!editingTodo) return null

  // Добавление подзадачи
  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        todo_id: editingTodo.id,
        name: newSubtask.trim(),
        done: false
      })
      .select()
      .single()

    if (!error && data) {
      setSubtasks([...subtasks, data])
      setNewSubtask('')
      toast.success('Подзадача добавлена')
    } else {
      toast.error('Не удалось добавить подзадачу')
    }
  }

  // Переключение статуса подзадачи
  const toggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find(s => s.id === subtaskId)
    if (!subtask) return

    const newDoneState = !subtask.done
    const { error } = await supabase
      .from('subtasks')
      .update({ done: newDoneState })
      .eq('id', subtaskId)

    if (!error) {
      setSubtasks(subtasks.map(s => 
        s.id === subtaskId ? { ...s, done: newDoneState } : s
      ))
      toast.success(newDoneState ? 'Подзадача выполнена' : 'Подзадача возвращена')
    } else {
      toast.error('Не удалось обновить статус')
    }
  }

  // Сохранение изменений
  const handleSave = async () => {
    if (!editingTodo) return

    const { error } = await supabase
      .from('todos')
      .update({
        name: editingTodo.name,
        deadline: editingTodo.deadline,
        notes: editingTodo.notes,
        category: editingTodo.category,
        repeat_type: editingTodo.repeat_type,
        repeat_ends: editingTodo.repeat_ends
      })
      .eq('id', editingTodo.id)

    if (!error) {
      onSave(editingTodo)
      toast.success('Изменения сохранены')
    } else {
      toast.error('Не удалось сохранить изменения')
    }
  }

  const addHours = (hours: number) => {
    const newDate = new Date()
    newDate.setHours(newDate.getHours() + hours)
    setDeadline(newDate)
  }

  const addDays = (days: number) => {
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + days)
    setDeadline(newDate)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl p-6 bg-gray-900 rounded-2xl shadow-xl space-y-4 my-8"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-medium text-white">Редактировать задачу</h3>

        {/* Название */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Название</label>
          <input
            type="text"
            value={editingTodo.name}
            onChange={e => setEditingTodo({ ...editingTodo, name: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
              text-white focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Заметка */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Заметка</label>
          <div className="min-h-[200px] overflow-y-auto">
            <RichTextEditor
              content={editingTodo.notes || ''}
              onChange={content => setEditingTodo({ ...editingTodo, notes: content })}
            />
          </div>
        </div>

        {/* Дедлайн */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Deadline</label>
          <div className="flex flex-col gap-2">
            <input
              type="datetime-local"
              value={deadline ? format(deadline, "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addHours(1)}
                className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white"
              >
                +1 час
              </button>
              <button
                type="button"
                onClick={() => addHours(3)}
                className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white"
              >
                +3 часа
              </button>
              <button
                type="button"
                onClick={() => addDays(1)}
                className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white"
              >
                +1 день
              </button>
            </div>
          </div>
        </div>

        {/* Категория */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Категория</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setEditingTodo({ ...editingTodo, category: category.id })}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${editingTodo.category === category.id 
                    ? `bg-${category.color}-400/20 text-${category.color}-400 border border-${category.color}-400/30` 
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }
                `}
              >
                <Icon icon={category.icon} className="w-5 h-5" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Подзадачи */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Подзадачи</label>
          
          {/* Список подзадач */}
          <div className="space-y-2">
            {subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleSubtask(subtask.id)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${subtask.done 
                      ? 'bg-emerald-400/20 text-emerald-400' 
                      : 'bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <Icon icon={subtask.done ? 'solar:check-circle-bold' : 'solar:circle-line-duotone'} className="w-5 h-5" />
                </button>
                <span className={`flex-1 ${subtask.done ? 'line-through text-white/40' : 'text-white'}`}>
                  {subtask.name}
                </span>
              </div>
            ))}
          </div>

          {/* Добавление подзадачи */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              placeholder="Новая подзадача"
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                text-white focus:outline-none focus:border-white/20"
              onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
            />
            <button
              onClick={handleAddSubtask}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                text-white font-medium transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 
              border border-white/10 text-white transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
              border border-white/20 text-white font-medium transition-colors"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 