'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BsCheckCircleFill } from 'react-icons/bs'
import { format, isAfter, addDays, addHours, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { UserIdContext } from '@/app/contexts/UserContext'
import { useContext } from 'react'
import { IoTimeOutline } from 'react-icons/io5'
import { MdOutlineCalendarToday, MdCheck, MdOutlineAccessTime, MdDelete } from 'react-icons/md'

type Todo = {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
}

interface TodoListProps {
  initialTodos: Todo[]
  onTodosChange?: (todos: Todo[]) => void
}

export default function TodoList({ initialTodos, onTodosChange }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
  const userId = useContext(UserIdContext)

  const setLoadingState = (id: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: state }))
  }

  // Обновляем родительский компонент при изменении списка задач
  useEffect(() => {
    if (onTodosChange) {
      onTodosChange(todos)
    }
  }, [todos, onTodosChange])

  useEffect(() => {
    // Загружаем существующие задачи при монтировании
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('telegram_id', userId)
          .order('deadline', { ascending: true })

        if (error) {
          console.error('Error fetching todos:', error)
          toast.error('Не удалось загрузить задачи')
        } else {
          setTodos(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodos()

    // Подписываемся на изменения
    const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos',
          filter: `telegram_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos(current => [...current, payload.new as Todo].sort((a, b) => 
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            ))
          } 
          else if (payload.eventType === 'DELETE') {
            setTodos(current => current.filter(todo => todo.id !== payload.old.id))
          } 
          else if (payload.eventType === 'UPDATE') {
            setTodos(current => 
              current.map(todo => 
                todo.id === payload.new.id ? payload.new as Todo : todo
              ).sort((a, b) => 
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      channels.unsubscribe()
    }
  }, [userId])

  const handleToggle = async (id: string) => {
    setLoadingState(id, true)
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      // Оптимистичное обновление
      setTodos(current => 
        current.map(t => t.id === id ? { ...t, done: !t.done } : t)
      )

      const { error } = await supabase
        .from('todos')
        .update({ done: !todo.done })
        .eq('id', id)
        .eq('telegram_id', userId)
      
      if (error) {
        // Откатываем изменения при ошибке
        setTodos(current => 
          current.map(t => t.id === id ? { ...t, done: todo.done } : t)
        )
        console.error('Error updating todo:', error)
        toast.error('Не удалось обновить статус задачи')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setLoadingState(id, false)
    }
  }

  const handleMove = async (id: string, type: 'plus2h' | 'plus1d') => {
    setLoadingState(id, true)
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      const currentDeadline = new Date(todo.deadline)
      const newDeadline = type === 'plus2h' 
        ? addHours(currentDeadline, 2)
        : addDays(currentDeadline, 1)

      // Оптимистичное обновление
      setTodos(current => 
        current.map(t => t.id === id ? { ...t, deadline: newDeadline.toISOString() } : t)
      )

      const { error } = await supabase
        .from('todos')
        .update({ deadline: newDeadline.toISOString() })
        .eq('id', id)
        .eq('telegram_id', userId)
      
      if (error) {
        // Откатываем изменения при ошибке
        setTodos(current => 
          current.map(t => t.id === id ? { ...t, deadline: todo.deadline } : t)
        )
        console.error('Error moving todo:', error)
        toast.error('Не удалось перенести задачу')
      } else {
        toast.success(
          type === 'plus2h' 
            ? 'Задача перенесена на 2 часа вперед'
            : 'Задача перенесена на завтра'
        )
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setLoadingState(id, false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoadingState(id, true)
    try {
      // Оптимистичное обновление
      const todoToDelete = todos.find(t => t.id === id)
      setTodos(current => current.filter(t => t.id !== id))

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('telegram_id', userId)
      
      if (error) {
        // Откатываем изменения при ошибке
        if (todoToDelete) {
          setTodos(current => [...current, todoToDelete])
        }
        console.error('Error deleting todo:', error)
        toast.error('Не удалось удалить задачу')
      } else {
        toast.success('Задача удалена')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setLoadingState(id, false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="flex gap-4 pb-4 snap-x snap-mandatory overflow-x-auto">
        {todos.map((todo) => {
          const deadlineDate = new Date(todo.deadline)
          const isOverdue = !todo.done && isAfter(new Date(), deadlineDate)
          const isLoading = loadingStates[todo.id]

          return (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex flex-col gap-4 p-6 rounded-2xl backdrop-blur-sm border snap-start
                min-w-[280px] max-w-[280px] transition-all duration-300
                ${isLoading ? 'opacity-50' : ''}
                ${todo.done 
                  ? 'text-white/40 line-through border-white/5 bg-white/5' 
                  : isOverdue
                    ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                    : 'text-white/90 border-white/10 bg-white/5'
                }
              `}
            >
              {/* Task Name */}
              <div className="flex items-start gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleToggle(todo.id)}
                  disabled={isLoading}
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-lg border transition-all duration-300
                    ${todo.done 
                      ? 'bg-emerald-500/20 border-emerald-500/30' 
                      : 'border-white/20 hover:border-white/40'
                    }
                    ${isLoading ? 'animate-pulse' : ''}
                  `}
                >
                  {todo.done && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <MdCheck className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  )}
                </motion.button>
                <span className="flex-1 text-lg">{todo.name}</span>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MdOutlineCalendarToday className="w-4 h-4" />
                <span>{format(new Date(todo.deadline), 'd MMMM, HH:mm', { locale: ru })}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                {/* Move Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMove(todo.id, 'plus2h')}
                    disabled={isLoading}
                    className={`
                      p-2 rounded-lg hover:bg-white/5 transition-all duration-300
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title="+2 часа"
                  >
                    <MdOutlineAccessTime className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMove(todo.id, 'plus1d')}
                    disabled={isLoading}
                    className={`
                      p-2 rounded-lg hover:bg-white/5 transition-all duration-300
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title="+1 день"
                  >
                    <MdOutlineCalendarToday className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(todo.id)}
                  disabled={isLoading}
                  className={`
                    p-2 rounded-lg hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 
                    transition-all duration-300
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <MdDelete className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
} 