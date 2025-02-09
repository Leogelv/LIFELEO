'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addHours, addDays, formatDistanceToNow, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { UserIdContext } from '@/app/contexts/UserContext'
import { useContext } from 'react'
import { IoTimeOutline } from 'react-icons/io5'
import { MdOutlineCalendarToday, MdCheck, MdOutlineAccessTime, MdDelete, MdOutlineRepeat, MdOutlineNotes, MdViewList, MdGridView, MdDoneAll, MdPendingActions } from 'react-icons/md'
import { logger } from '@/utils/logger'
import { Icon } from '@iconify/react'
import { useContacts } from '@/app/hooks/useContacts'
import { TodoCard } from '@/app/components/TodoCard'
import { EditTodoModal } from '@/app/components/EditTodoModal'

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

// Вспомогательные функции для работы с категориями
const getCategoryStyle = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId)
  if (!category) return 'bg-white/10 text-white/60'
  return `bg-${category.color}-400/20 text-${category.color}-400`
}

const getCategoryIcon = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.icon || 'solar:tag-bold'
}

const getCategoryName = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.name || categoryId
}

type Subtask = {
  id: string
  todo_id: string
  name: string
  done: boolean
  created_at: string
}

type Todo = {
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
  contact_id?: string | null
}

interface TodoListProps {
  initialTodos: Todo[]
  onTodosChange?: (todos: Todo[]) => void
  showHabits?: boolean
}

// Добавляем интерфейс для значений привычек
const habitValues = {
  water: [
    { value: 300, label: '300 мл' },
    { value: 500, label: '500 мл' },
    { value: 1000, label: '1 л' }
  ],
  sport: [
    { value: 30, label: '30 мин' },
    { value: 60, label: '1 час' },
    { value: 90, label: '1.5 часа' }
  ],
  meditation: [
    { value: 10, label: '10 мин' },
    { value: 30, label: '30 мин' },
    { value: 60, label: '1 час' }
  ],
  breathing: [
    { value: 5, label: '5 мин' },
    { value: 10, label: '10 мин' },
    { value: 15, label: '15 мин' }
  ]
}

export default function TodoList({ initialTodos, onTodosChange, showHabits }: TodoListProps) {
  // Если showHabits=true, не показываем TodoList вообще
  if (showHabits) {
    return null;
  }

  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [listView, setListView] = useState<'vertical' | 'horizontal'>('vertical')
  const [hideCompleted, setHideCompleted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const userId = useContext(UserIdContext)
  const { contacts } = useContacts()

  // Загрузка тасков
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        logger.debug('Начинаем загрузку тасков', { userId })
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('telegram_id', userId)
          .eq('is_habit', false) // Не загружаем привычки
          .order('deadline', { ascending: true })

        if (error) {
          logger.error('Ошибка при загрузке тасков', { error })
          toast.error('Не удалось загрузить задачи')
          return
        }

        logger.info('Таски успешно загружены', { count: data?.length })
        setTodos(data || [])
      } catch (error) {
        logger.error('Неожиданная ошибка при загрузке тасков', { error })
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }

    // Подписка на изменения
    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos',
          filter: `telegram_id=eq.${userId} and is_habit=eq.false`
        },
        (payload) => {
          logger.debug('Получено изменение в тасках', { 
            eventType: payload.eventType,
            newData: payload.new,
            oldData: payload.old
          })

          if (payload.eventType === 'INSERT') {
            setTodos(current => sortTodos([...current, payload.new as Todo]))
          } 
          else if (payload.eventType === 'DELETE') {
            setTodos(current => current.filter(todo => todo.id !== payload.old.id))
          } 
          else if (payload.eventType === 'UPDATE') {
            setTodos(current => 
              sortTodos(current.map(todo => 
                todo.id === payload.new.id ? payload.new as Todo : todo
              ))
            )
          }
        }
      )
      .subscribe()

    if (userId) {
      fetchTodos()
    }

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  // Обновляем родительский компонент при изменении списка задач
  useEffect(() => {
    if (onTodosChange) {
      onTodosChange(todos)
    }
  }, [todos, onTodosChange])

  // Вспомогательные функции
  const setLoadingState = (id: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: state }))
  }

  const createNextRecurringTask = async (todo: Todo) => {
    if (!todo.repeat_type || !todo.deadline) return

    const currentDeadline = new Date(todo.deadline)
    let nextDeadline: Date

    switch (todo.repeat_type) {
      case 'daily':
        nextDeadline = addDays(currentDeadline, 1)
        break
      case 'weekly':
        nextDeadline = addDays(currentDeadline, 7)
        break
      case 'monthly':
        nextDeadline = new Date(currentDeadline.setMonth(currentDeadline.getMonth() + 1))
        break
      default:
        return
    }

    // Проверяем, не превышает ли следующая дата дату окончания повторений
    if (todo.repeat_ends && isAfter(nextDeadline, new Date(todo.repeat_ends))) {
      return
    }

    const { error } = await supabase
      .from('todos')
      .insert({
        name: todo.name,
        done: false,
        deadline: nextDeadline.toISOString(),
        telegram_id: userId,
        notes: todo.notes,
        repeat_type: todo.repeat_type,
        repeat_ends: todo.repeat_ends,
        category: todo.category,
        tags: todo.tags
      })

    if (error) {
      console.error('Error creating next recurring task:', error)
      toast.error('Не удалось создать следующую повторяющуюся задачу')
    }
  }

  // Сортировка тасков
  const sortTodos = (todosToSort: Todo[]) => {
    return [...todosToSort].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }

  // Фильтруем и сортируем задачи
  const filteredTodos = sortTodos(todos.filter(todo => {
    if (hideCompleted) {
      return !todo.done // Показываем только невыполненные
    }
    return todo.done // Показываем только выполненные
  }))

  // Обработка выполнения задачи
  const handleToggle = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    // Оптимистичное обновление
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ))

    try {
      const { error } = await supabase
        .from('todos')
        .update({ done: !todo.done })
        .eq('id', id)

      if (error) throw error

      logger.info('Задача обновлена', { id, done: !todo.done })
      
      // Показываем уведомление
      toast.success(
        <div className="flex items-center gap-2">
          <MdDoneAll className="w-5 h-5" />
          <div>
            <div className="font-medium">{todo.name}</div>
            <div className="text-sm opacity-80">
              {!todo.done ? 'Задача выполнена!' : 'Задача возвращена'}
            </div>
          </div>
        </div>
      )

      // Если задача выполнена и имеет повторение, создаем следующую
      if (!todo.done && todo.repeat_type) {
        await createNextRecurringTask(todo)
      }

    } catch (error) {
      logger.error('Ошибка при обновлении задачи', { error })
      toast.error('Не удалось обновить задачу')
      
      // Откатываем изменения
      setTodos(prev => prev.map(t => 
        t.id === id ? { ...t, done: todo.done } : t
      ))
    }
  }

  // Редактирование таска
  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo)
  }

  // Сохранение изменений
  const handleSave = (updatedTodo: Todo) => {
    setTodos(current => 
      current.map(todo => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
    )
    setSelectedTodo(null)
  }

  // Удаление таска
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('telegram_id', userId)

      if (error) {
        toast.error('Не удалось удалить задачу')
        return
      }

      setTodos(current => current.filter(todo => todo.id !== id))
      toast.success('Задача удалена')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    }
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {/* Переключатель вида списка */}
        <button
          onClick={() => setListView(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {listView === 'vertical' ? <MdGridView className="w-5 h-5" /> : <MdViewList className="w-5 h-5" />}
        </button>

        {/* Фильтры */}
        <div className="flex gap-2">
          <button
            onClick={() => setHideCompleted(false)}
            className={`
              p-2 rounded-lg transition-colors
              ${!hideCompleted 
                ? 'bg-rose-400/20 text-rose-400' 
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
          >
            <MdDoneAll className="w-5 h-5" />
          </button>
          <button
            onClick={() => setHideCompleted(true)}
            className={`
              p-2 rounded-lg transition-colors
              ${hideCompleted
                ? 'bg-rose-400/20 text-rose-400'
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
          >
            <MdPendingActions className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Список задач */}
      <AnimatePresence mode="popLayout">
        <div className={`
          ${listView === 'horizontal' 
            ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory' 
            : 'grid gap-4'
          }
        `}>
          {filteredTodos.map(todo => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0,
                scale: 0.8,
                x: todo.done ? 100 : 0,
                transition: { duration: 0.5 }
              }}
              className={listView === 'horizontal' ? 'snap-start' : ''}
            >
              <TodoCard
                todo={todo}
                listView={listView}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Модальное окно редактирования */}
      <AnimatePresence>
        {selectedTodo && (
          <EditTodoModal
            todo={selectedTodo}
            onClose={() => setSelectedTodo(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 