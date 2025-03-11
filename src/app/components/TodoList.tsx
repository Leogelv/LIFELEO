'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { UserIdContext } from '@/app/contexts/UserContext'
import { useContext } from 'react'
import { MdViewList, MdGridView, MdDoneAll, MdPendingActions, MdRefresh } from 'react-icons/md'
import { logger } from '@/utils/logger'
import { TodoCard } from '@/app/components/TodoCard'
import { EditTodoModal } from '@/app/components/EditTodoModal'
import { Todo } from '@/types/todo'
import { realtime } from '@/utils/realtime'

interface TodoListProps {
  initialTodos: Todo[]
  onTodosChange?: (todos: Todo[]) => void
  listView?: 'vertical' | 'horizontal'
  hideCompleted?: boolean
}

export default function TodoList({ 
  initialTodos, 
  onTodosChange, 
  listView: initialListView = 'vertical', 
  hideCompleted: initialHideCompleted = true 
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [listView, setListView] = useState<'vertical' | 'horizontal'>(initialListView)
  const [isHideCompleted, setIsHideCompleted] = useState(initialHideCompleted)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const userId = useContext(UserIdContext)

  // Загрузка тасков
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        logger.debug('Начинаем загрузку тасков', { userId })
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('telegram_id', userId)
          .order('deadline', { ascending: true })

        if (error) {
          logger.error('Ошибка при загрузке тасков', { error })
          toast.error('Не удалось загрузить задачи')
          return
        }

        // Проверяем и фиксируем значения done, чтобы они точно были boolean
        const fixedTodos = data?.map(task => ({
          ...task,
          done: Boolean(task.done) // Преобразуем в true/false
        }))

        // Проверяем и логируем задачи, в которых могут быть расхождения с БД
        const suspiciousTasks = fixedTodos?.filter(task => {
          // Проверка на несоответствие между UI и базой данных
          const uiTask = todos.find(t => t.id === task.id);
          return uiTask && uiTask.done !== task.done;
        });
        
        if (suspiciousTasks && suspiciousTasks.length > 0) {
          logger.warn('Обнаружены задачи с разным статусом в UI и БД:', { 
            tasks: suspiciousTasks.map(t => ({ id: t.id, name: t.name, done_in_db: t.done })) 
          });
          
          // Показываем уведомление, если есть проблемные задачи
          toast.warning(`Обнаружены задачи с неправильным статусом (${suspiciousTasks.length}). Статус обновлен из БД.`);
        }

        logger.info('Таски успешно загружены', { count: data?.length })
        setTodos(fixedTodos || [])
      } catch (error) {
        logger.error('Неожиданная ошибка при загрузке тасков', { error })
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }

    let unsubscribe: (() => void) | undefined

    if (userId) {
      fetchTodos()
      
      // Подписываемся на изменения через realtime менеджер
      unsubscribe = realtime.subscribe(`todos-${userId}`, (payload) => {
        // Проверяем что это наш таск и наш userId
        const isOurTask = (
          (payload.new && 'telegram_id' in payload.new && 
           payload.new.telegram_id === userId) ||
          (payload.old && 'telegram_id' in payload.old && 
           payload.old.telegram_id === userId)
        )

        if (!isOurTask) return

        logger.info('🔄 Realtime: Получено изменение в тасках', { 
          eventType: payload.eventType,
          task: payload.new && 'name' in payload.new ? payload.new.name : 
                payload.old && 'name' in payload.old ? payload.old.name : 'unknown',
          id: payload.new && 'id' in payload.new ? payload.new.id : 
              payload.old && 'id' in payload.old ? payload.old.id : 'unknown',
          userId: userId
        })
        
        if (!payload.new && !payload.old) {
          logger.error('🔄 Realtime: Получены пустые данные')
          return
        }

        try {
          if (payload.eventType === 'INSERT') {
            logger.debug('📥 Добавляем новую задачу в список', payload.new)
            setTodos(current => {
              const newTodos = sortTodos([...current, payload.new as Todo])
              logger.debug('📥 Новый список задач:', newTodos)
              return newTodos
            })
          } 
          else if (payload.eventType === 'DELETE') {
            logger.debug('🗑️ Удаляем задачу из списка', payload.old)
            setTodos(current => {
              const newTodos = current.filter(todo => todo.id !== payload.old.id)
              logger.debug('🗑️ Новый список задач:', newTodos)
              return newTodos
            })
          } 
          else if (payload.eventType === 'UPDATE') {
            logger.debug('✏️ Обновляем задачу в списке', payload.new)
            setTodos(current => {
              const newTodos = sortTodos(current.map(todo => 
                todo.id === payload.new.id ? payload.new as Todo : todo
              ))
              logger.debug('✏️ Новый список задач:', newTodos)
              return newTodos
            })
          }
        } catch (error) {
          logger.error('🔄 Ошибка при обработке realtime события:', error)
        }
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId])

  // Обновляем родительский компонент при изменении списка задач
  useEffect(() => {
    if (onTodosChange) {
      onTodosChange(todos)
    }
  }, [todos, onTodosChange])

  // Сортировка тасков
  const sortTodos = (todosToSort: Todo[]) => {
    return [...todosToSort].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }

  // Фильтруем и сортируем задачи на основе строгой проверки на done
  const filteredTodos = sortTodos(todos.filter(todo => {
    // Проверяем, что значение done точно приведено к boolean
    const isDone = Boolean(todo.done)
    
    if (isHideCompleted) {
      return !isDone // Показываем только невыполненные
    }
    return true // Показываем все
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
      logger.debug('Отправка запроса на изменение статуса задачи:', { id, newStatus: !todo.done })
      
      const { error, data } = await supabase
        .from('todos')
        .update({ done: !todo.done })
        .eq('id', id)
        .select('*')

      if (error) throw error

      logger.info('Задача обновлена в БД:', { 
        id, 
        done: !todo.done, 
        response: data 
      })
      
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

  // Функция для принудительной синхронизации с БД
  const syncWithDatabase = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      logger.info('Запуск принудительной синхронизации с БД');
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('telegram_id', userId)
        .order('deadline', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Сравниваем данные из БД с локальным состоянием
      const localTasks = [...todos];
      const remoteTasks = data || [];
      
      const changedTasks = remoteTasks.filter(remoteTask => {
        const localTask = localTasks.find(t => t.id === remoteTask.id);
        return localTask && (localTask.done !== remoteTask.done);
      });
      
      if (changedTasks.length > 0) {
        logger.warn('Найдены задачи с несоответствием статуса:', changedTasks);
        toast.success(`Синхронизировано задач: ${changedTasks.length}`);
      } else {
        toast.info('Все задачи уже синхронизированы');
      }
      
      // Обновляем локальное состояние
      setTodos(remoteTasks);
      
    } catch (error) {
      logger.error('Ошибка при синхронизации с БД', error);
      toast.error('Не удалось синхронизировать задачи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {/* Переключатель вида списка */}
        <button
          onClick={() => setListView(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Переключить вид списка"
        >
          {listView === 'vertical' ? <MdGridView className="w-5 h-5" /> : <MdViewList className="w-5 h-5" />}
        </button>

        {/* Кнопка синхронизации с БД */}
        <button
          onClick={syncWithDatabase}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Синхронизировать с базой данных"
        >
          <MdRefresh className="w-5 h-5" />
        </button>

        {/* Фильтры */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsHideCompleted(false)}
            className={`
              p-2 rounded-lg transition-colors
              ${!isHideCompleted 
                ? 'bg-rose-400/20 text-rose-400' 
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
            title="Показать все задачи"
          >
            <MdDoneAll className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsHideCompleted(true)}
            className={`
              p-2 rounded-lg transition-colors
              ${isHideCompleted
                ? 'bg-rose-400/20 text-rose-400'
                : 'bg-white/5 hover:bg-white/10'
              }
            `}
            title="Показать только невыполненные"
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