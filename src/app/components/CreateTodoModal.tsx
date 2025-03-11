'use client'

import { useState, useRef, useEffect } from 'react'
import { Todo } from '@/types/todo'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addHours, addDays, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Icon } from '@iconify/react'
import { MdCategory, MdAdd, MdOutlineSubtitles, MdClose, MdOutlineCalendarToday, MdOutlineAccessTime } from 'react-icons/md'
import { Button } from './ui/Button'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useTelegram } from '@/app/hooks/useTelegram'
import { v4 as uuidv4 } from 'uuid'

interface Subtask {
  id: string
  todo_id: string
  name: string
  done: boolean
  created_at: string
}

interface CreateTodoModalProps {
  onClose: () => void
  onSave: (todo: Todo) => void
}

export function CreateTodoModal({ onClose, onSave }: CreateTodoModalProps) {
  const { safeAreaInset, isTelegramWebApp } = useTelegram()
  const [taskName, setTaskName] = useState('')
  const [notes, setNotes] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [deadline, setDeadline] = useState<Date>(new Date())
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskName, setNewSubtaskName] = useState('')

  const { userId } = useTelegram()
  const nameInputRef = useRef<HTMLInputElement>(null)
  
  // Автофокус на поле ввода
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])
  
  // Если имя задачи не пустое, показываем расширенную форму
  useEffect(() => {
    if (taskName.length > 0) {
      setShowDetails(true)
    }
  }, [taskName])

  // Категории для выбора
  const categories = [
    { id: 'water', name: 'Вода', icon: 'solar:glass-water-bold' },
    { id: 'sport', name: 'Спорт', icon: 'solar:running-round-bold' },
    { id: 'meditation', name: 'Медитация', icon: 'solar:meditation-bold' },
    { id: 'breathing', name: 'Дыхание', icon: 'solar:breathing-bold' },
    { id: 'work', name: 'Работа', icon: 'solar:laptop-bold' },
    { id: 'home', name: 'Дом', icon: 'solar:home-2-bold' },
    { id: 'finance', name: 'Финансы', icon: 'solar:wallet-money-bold' }
  ]

  // Обработка добавления подзадачи
  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim()) return
    
    const newSubtask: Subtask = {
      id: uuidv4(),
      todo_id: '', // Будет обновлено после создания основной задачи
      name: newSubtaskName,
      done: false,
      created_at: new Date().toISOString()
    }
    
    setSubtasks([...subtasks, newSubtask])
    setNewSubtaskName('')
  }

  // Переключение статуса подзадачи
  const toggleSubtask = async (subtaskId: string) => {
    setSubtasks(current => 
      current.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, done: !subtask.done } 
          : subtask
      )
    )
  }

  // Удаление подзадачи
  const deleteSubtask = (subtaskId: string) => {
    setSubtasks(current => current.filter(s => s.id !== subtaskId))
  }

  // Сохранение задачи
  const handleSave = async () => {
    if (!taskName.trim() || !userId) return
    
    try {
      // Создаем основную задачу
      const { data, error } = await supabase
        .from('todos')
        .insert({
          name: taskName,
          deadline: deadline.toISOString(),
          telegram_id: userId,
          done: false,
          notes: notes || null,
          category: category || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      // Если есть подзадачи, создаем их
      if (subtasks.length > 0 && data) {
        const todoId = data.id
        
        const subtasksWithTodoId = subtasks.map(subtask => ({
          ...subtask,
          todo_id: todoId
        }))
        
        const { error: subtasksError } = await supabase
          .from('subtasks')
          .insert(subtasksWithTodoId)
        
        if (subtasksError) {
          console.error('Ошибка при создании подзадач:', subtasksError)
          toast.error('Задача создана, но возникли проблемы с подзадачами')
        }
      }
      
      toast.success('Задача создана!')
      onSave(data)
      onClose()
      
    } catch (error) {
      console.error('Ошибка при создании задачи:', error)
      toast.error('Не удалось создать задачу')
    }
  }

  // Обновление дедлайна
  const updateDeadline = (newDate: Date | null) => {
    if (newDate) {
      setDeadline(newDate)
    }
  }

  // Добавление часов к дедлайну
  const addHoursToDeadline = (hours: number) => {
    setDeadline(current => addHours(current, hours))
  }

  // Добавление дней к дедлайну
  const addDaysToDeadline = (days: number) => {
    setDeadline(current => addDays(current, days))
  }

  // Установка дедлайна на сегодня
  const setToday = () => {
    const today = new Date()
    today.setHours(new Date().getHours() + 2)
    today.setMinutes(0)
    today.setSeconds(0)
    setDeadline(today)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-gray-900 rounded-lg shadow-lg overflow-hidden"
        style={{
          paddingTop: isTelegramWebApp ? `${safeAreaInset.top}px` : '16px',
          paddingBottom: isTelegramWebApp ? `${safeAreaInset.bottom}px` : '16px',
          paddingLeft: isTelegramWebApp ? `${safeAreaInset.left}px` : '16px',
          paddingRight: isTelegramWebApp ? `${safeAreaInset.right}px` : '16px'
        }}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Новая задача</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <MdClose className="text-white w-5 h-5" />
          </button>
        </div>

        {/* Поле ввода названия */}
        <div className="mb-4">
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Что нужно сделать?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Дополнительные поля - появляются при вводе названия */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Дедлайн */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Дедлайн</label>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => addHoursToDeadline(1)}
                      className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
                    >
                      +1ч
                    </button>
                    <button 
                      onClick={() => addDaysToDeadline(1)}
                      className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
                    >
                      +1д
                    </button>
                    <button 
                      onClick={setToday}
                      className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
                    >
                      <MdOutlineCalendarToday className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-white">
                  <div className="flex items-center gap-2">
                    <MdOutlineAccessTime className="text-gray-400" />
                    <span>
                      {format(deadline, 'dd MMMM, HH:mm', { locale: ru })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Категория */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Категория</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`
                        p-2 rounded-lg flex items-center gap-1 transition-colors
                        ${category === cat.id ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                      `}
                    >
                      <Icon icon={cat.icon} className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Заметка */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Заметка</label>
                <textarea
                  placeholder="Дополнительная информация..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>

              {/* Подзадачи */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Подзадачи</label>
                
                {/* Список подзадач */}
                <div className="space-y-2 mb-2">
                  {subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                      <button
                        onClick={() => toggleSubtask(subtask.id)}
                        className={`
                          p-1 rounded-md
                          ${subtask.done ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}
                        `}
                      >
                        <Icon 
                          icon={subtask.done ? "solar:check-circle-bold" : "solar:circle-outline"} 
                          className="w-5 h-5" 
                        />
                      </button>
                      <span className={`flex-1 text-white ${subtask.done ? 'line-through opacity-60' : ''}`}>
                        {subtask.name}
                      </span>
                      <button
                        onClick={() => deleteSubtask(subtask.id)}
                        className="p-1 rounded-md hover:bg-gray-700 text-gray-400"
                      >
                        <MdClose className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Добавление подзадачи */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Добавить подзадачу..."
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask()
                    }}
                    className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <MdAdd className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!taskName.trim()}
                >
                  Создать
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 