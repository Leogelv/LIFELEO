'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BsCheckCircleFill } from 'react-icons/bs'
import { format, isAfter, addDays, addHours, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { UserIdContext } from '@/app/page'
import { useContext } from 'react'
import { IoTimeOutline } from 'react-icons/io5'
import { MdOutlineCalendarToday } from 'react-icons/md'

type Todo = {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [isLoading, setIsLoading] = useState(true)
  const userId = useContext(UserIdContext)

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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('telegram_id', userId)

      if (error) {
        console.error('Error deleting todo:', error)
        toast.error('Не удалось удалить задачу')
      } else {
        toast.success('Задача удалена')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
    }
  }

  const handlePostpone = async (id: string, type: 'hours' | 'days') => {
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      const newDeadline = type === 'hours' 
        ? addHours(new Date(todo.deadline), 2)
        : addDays(new Date(todo.deadline), 1)

      const { error } = await supabase
        .from('todos')
        .update({ deadline: newDeadline.toISOString() })
        .eq('id', id)
        .eq('telegram_id', userId)

      if (error) {
        console.error('Error postponing todo:', error)
        toast.error('Не удалось перенести задачу')
      } else {
        toast.success(type === 'hours' ? 'Перенесено на 2 часа' : 'Перенесено на завтра')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Что-то пошло не так')
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
    <AnimatePresence mode="popLayout">
      {todos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-white/40"
        >
          Нет задач. Добавьте новую задачу выше ☝️
        </motion.div>
      ) : (
        todos.map((todo) => {
          const deadlineDate = new Date(todo.deadline)
          const isOverdue = !todo.done && isAfter(new Date(), deadlineDate)

          return (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              className="group relative mb-3"
            >
              <div className={`
                flex items-center gap-4 p-4 rounded-xl backdrop-blur-lg
                border transition-all duration-300
                ${isOverdue 
                  ? 'border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20' 
                  : todo.done
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'border-white/10 bg-gradient-to-r from-rose-400/10 to-pink-400/10 hover:from-rose-400/20 hover:to-pink-400/20'
                }
              `}>
                {/* Чекбокс */}
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('todos')
                        .update({ done: !todo.done })
                        .eq('id', todo.id)
                        .eq('telegram_id', userId)
                      
                      if (error) {
                        console.error('Error updating todo:', error)
                        toast.error('Не удалось обновить статус задачи')
                      }
                    } catch (error) {
                      console.error('Error:', error)
                      toast.error('Что-то пошло не так')
                    }
                  }}
                  className="relative w-6 h-6 flex-shrink-0"
                >
                  <div className={`
                    absolute inset-0 rounded-full border-2 transition-colors duration-200
                    ${todo.done 
                      ? 'border-rose-400 bg-rose-400' 
                      : isOverdue
                        ? 'border-rose-500 group-hover:border-rose-500'
                        : 'border-white/20 group-hover:border-rose-400/50'
                    }
                  `} />
                  <BsCheckCircleFill 
                    className={`
                      absolute inset-0 w-6 h-6 text-white transform transition-all duration-200
                      ${todo.done ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
                    `}
                  />
                </button>

                {/* Название задачи */}
                <span className={`
                  flex-1 transition-all duration-200
                  ${todo.done ? 'text-white/40 line-through' : isOverdue ? 'text-rose-500' : 'text-white'}
                `}>
                  {todo.name}
                </span>

                {/* Дедлайн и быстрые действия */}
                <div className="flex items-center gap-3">
                  {/* Кнопки переноса */}
                  {!todo.done && (
                    <>
                      <button
                        onClick={() => handlePostpone(todo.id, 'hours')}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg 
                          bg-white/5 hover:bg-white/10 text-white/60 hover:text-white 
                          transition-all duration-200"
                      >
                        <IoTimeOutline className="w-4 h-4" />
                        <span className="text-xs">+2ч</span>
                      </button>
                      <button
                        onClick={() => handlePostpone(todo.id, 'days')}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg 
                          bg-white/5 hover:bg-white/10 text-white/60 hover:text-white 
                          transition-all duration-200"
                      >
                        <MdOutlineCalendarToday className="w-4 h-4" />
                        <span className="text-xs">+1д</span>
                      </button>
                    </>
                  )}

                  {/* Дедлайн */}
                  <div className="flex flex-col items-end text-xs min-w-[100px]">
                    <span className={`
                      ${isOverdue ? 'text-rose-500' : 'text-rose-400/80'}
                    `}>
                      {format(deadlineDate, 'd MMM HH:mm', { locale: ru })}
                    </span>
                    <span className={`
                      ${isOverdue ? 'text-rose-500/60' : 'text-white/40'}
                    `}>
                      {isOverdue 
                        ? `Просрочено на ${formatDistanceToNow(deadlineDate, { locale: ru })}`
                        : `Через ${formatDistanceToNow(deadlineDate, { locale: ru })}`
                      }
                    </span>
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="ml-2 px-3 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 
                      text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 
                      transition-all duration-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })
      )}
    </AnimatePresence>
  )
} 