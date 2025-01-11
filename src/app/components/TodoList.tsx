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
import { IoTimeOutline, IoCloseCircleOutline } from 'react-icons/io5'
import { MdOutlineCalendarToday, MdCheck, MdOutlineAccessTime, MdDelete, MdOutlineRepeat } from 'react-icons/md'

type Todo = {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
  comment?: string
  repeat_type?: 'daily' | 'weekly' | 'monthly'
  repeat_ends?: string
}

interface TodoListProps {
  initialTodos: Todo[]
  onTodosChange?: (todos: Todo[]) => void
  listView: 'horizontal' | 'vertical'
}

export default function TodoList({ initialTodos, onTodosChange, listView }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
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

  const createNextRecurringTask = async (todo: Todo) => {
    if (!todo.repeat_type || !todo.deadline) return;

    const currentDeadline = new Date(todo.deadline);
    let nextDeadline: Date;

    switch (todo.repeat_type) {
      case 'daily':
        nextDeadline = addDays(currentDeadline, 1);
        break;
      case 'weekly':
        nextDeadline = addDays(currentDeadline, 7);
        break;
      case 'monthly':
        nextDeadline = new Date(currentDeadline.setMonth(currentDeadline.getMonth() + 1));
        break;
      default:
        return;
    }

    // Проверяем, не превышает ли следующая дата дату окончания повторений
    if (todo.repeat_ends && isAfter(nextDeadline, new Date(todo.repeat_ends))) {
      return;
    }

    const { error } = await supabase
      .from('todos')
      .insert({
        name: todo.name,
        done: false,
        deadline: nextDeadline.toISOString(),
        telegram_id: userId,
        comment: todo.comment,
        repeat_type: todo.repeat_type,
        repeat_ends: todo.repeat_ends
      });

    if (error) {
      console.error('Error creating next recurring task:', error);
      toast.error('Не удалось создать следующую повторяющуюся задачу');
    }
  };

  const handleToggle = async (id: string) => {
    setLoadingState(id, true);
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const newDoneState = !todo.done;

      // Оптимистичное обновление
      setTodos(current => 
        current.map(t => t.id === id ? { ...t, done: newDoneState } : t)
      );

      const { error } = await supabase
        .from('todos')
        .update({ done: newDoneState })
        .eq('id', id)
        .eq('telegram_id', userId);
      
      if (error) {
        // Откатываем изменения при ошибке
        setTodos(current => 
          current.map(t => t.id === id ? { ...t, done: todo.done } : t)
        );
        console.error('Error updating todo:', error);
        toast.error('Не удалось обновить статус задачи');
        return;
      }

      // Если задача отмечена как выполненная и это повторяющаяся задача
      if (newDoneState && todo.repeat_type) {
        await createNextRecurringTask(todo);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Что-то пошло не так');
    } finally {
      setLoadingState(id, false);
    }
  };

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
      <div className={`
        ${listView === 'horizontal' 
          ? 'flex gap-4 pb-4 snap-x snap-mandatory overflow-x-auto' 
          : 'grid grid-cols-1 gap-3 w-full'
        }
      `}>
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
              whileHover={{ scale: listView === 'horizontal' ? 1.02 : 1 }}
              whileTap={{ scale: listView === 'horizontal' ? 0.98 : 0.995 }}
              onClick={() => setSelectedTodo(todo)}
              className={`
                backdrop-blur-sm border transition-all duration-300 cursor-pointer
                ${listView === 'horizontal'
                  ? 'flex flex-col gap-4 p-6 rounded-2xl snap-start min-w-[280px] max-w-[280px]'
                  : 'flex flex-col gap-2 p-4 rounded-xl'
                }
                ${isLoading ? 'opacity-50' : ''}
                ${todo.done 
                  ? 'text-white/40 line-through border-white/5 bg-white/5' 
                  : isOverdue
                    ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                    : 'text-white/90 border-white/10 bg-white/5'
                }
              `}
            >
              {/* Task Name and Checkbox */}
              <div className={`
                flex items-start gap-3
                ${listView === 'horizontal' ? '' : 'w-full'}
              `}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle(todo.id)
                  }}
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
                <div className="flex-1">
                  <span className={`${listView === 'horizontal' ? 'text-lg' : 'text-base'}`}>
                    {todo.name}
                  </span>
                  {listView === 'vertical' && todo.comment && (
                    <div className="text-sm text-white/40 mt-1">{todo.comment}</div>
                  )}
                </div>
              </div>

              {/* Deadline and Actions */}
              {listView === 'horizontal' ? (
                <>
                  {/* Horizontal view - existing code */}
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MdOutlineCalendarToday className="w-4 h-4" />
                    <span>{format(new Date(todo.deadline), 'd MMMM, HH:mm', { locale: ru })}</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    {/* Move Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMove(todo.id, 'plus2h')
                        }}
                        disabled={isLoading}
                        className={`
                          p-2 rounded-lg hover:bg-white/5 transition-all duration-300 group
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title="+2 часа"
                      >
                        <MdOutlineAccessTime className="w-5 h-5" />
                        <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 
                          px-2 py-1 text-xs bg-black/80 rounded whitespace-nowrap">+2 часа</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMove(todo.id, 'plus1d')
                        }}
                        disabled={isLoading}
                        className={`
                          p-2 rounded-lg hover:bg-white/5 transition-all duration-300 group
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        title="+1 день"
                      >
                        <MdOutlineCalendarToday className="w-5 h-5" />
                        <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 
                          px-2 py-1 text-xs bg-black/80 rounded whitespace-nowrap">+1 день</span>
                      </motion.button>
                    </div>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(todo.id)
                      }}
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
                </>
              ) : (
                /* Vertical view - compact actions */
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MdOutlineCalendarToday className="w-4 h-4" />
                      <span>{format(new Date(todo.deadline), 'd MMM, HH:mm', { locale: ru })}</span>
                    </div>
                    {todo.repeat_type && (
                      <div className="text-white/40">
                        <MdOutlineRepeat className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMove(todo.id, 'plus2h')
                      }}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <MdOutlineAccessTime className="w-4 h-4 text-white/60" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMove(todo.id, 'plus1d')
                      }}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <MdOutlineCalendarToday className="w-4 h-4 text-white/60" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(todo.id)
                      }}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors"
                    >
                      <MdDelete className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTodo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTodo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#2A2A2A] rounded-2xl p-6 max-w-lg w-full space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium">{selectedTodo.name}</h3>
                <button
                  onClick={() => setSelectedTodo(null)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <IoCloseCircleOutline className="w-6 h-6" />
                </button>
              </div>

              {selectedTodo.comment && (
                <div className="space-y-2">
                  <h4 className="text-sm text-white/60">Заметка</h4>
                  <p className="text-white/80 bg-white/5 p-4 rounded-xl">{selectedTodo.comment}</p>
                </div>
              )}

              {selectedTodo.repeat_type && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <MdOutlineRepeat className="w-4 h-4" />
                  <span>
                    {selectedTodo.repeat_type === 'daily' && 'Каждый день'}
                    {selectedTodo.repeat_type === 'weekly' && 'Каждую неделю'}
                    {selectedTodo.repeat_type === 'monthly' && 'Каждый месяц'}
                    {selectedTodo.repeat_ends && ` до ${format(new Date(selectedTodo.repeat_ends), 'd MMMM', { locale: ru })}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-white/60">
                <MdOutlineCalendarToday className="w-4 h-4" />
                <span>{format(new Date(selectedTodo.deadline), 'd MMMM, HH:mm', { locale: ru })}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 