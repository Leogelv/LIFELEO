'use client'

import TodoList from '../components/TodoList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import { useState, useEffect, useRef } from 'react'
import { Todo } from '@/types/todo'
import { TaskCalendar } from '../components/tasks/TaskCalendar'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { useContext } from 'react'
import { UserIdContext } from '@/app/contexts/UserContext'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { format, addHours, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MdOutlineCalendarToday, MdAdd, MdOutlineAccessTime, MdRefresh } from 'react-icons/md'

type ViewMode = 'list' | 'calendar'

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [forceRefresh, setForceRefresh] = useState(0) // Счетчик для принудительного обновления
  const userId = useContext(UserIdContext)
  const [taskName, setTaskName] = useState('')
  const [deadline, setDeadline] = useState<Date>(new Date())
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Функция принудительного обновления
  const handleForceRefresh = () => {
    toast.info('Очистка кеша и синхронизация с базой...')
    logger.info('Принудительное обновление данных из базы и очистка кеша')
    setForceRefresh(prev => prev + 1) // Инкрементируем счетчик для триггера useEffect
  }

  // Загрузка задач напрямую из БД при инициализации и переключении вида
  useEffect(() => {
    const loadTasksFromDB = async () => {
      if (!userId) return
      
      setIsLoading(true)
      
      try {
        logger.info('Загрузка задач напрямую из БД')
        
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('telegram_id', userId)
          .order('deadline', { ascending: true })
          
        if (error) {
          throw error
        }
        
        // Фиксируем статус done, чтобы он строго был boolean
        const fixedTodos = data?.map(task => ({
          ...task,
          done: task.done === true // Строгое приведение к boolean через прямое сравнение
        })) || []
        
        // Логируем данные для отладки
        logger.info('Получены задачи из БД:', { 
          count: fixedTodos.length,
          tasks: fixedTodos.map(t => ({ id: t.id, name: t.name, done: t.done, typeOfDone: typeof t.done }))
        })
        
        // Проверяем и логируем неправильные задачи
        const suspiciousTasks = fixedTodos.filter(task => {
          const rawDone = data?.find(t => t.id === task.id)?.done
          return rawDone !== task.done
        })
        
        if (suspiciousTasks.length > 0) {
          logger.warn('Неверные статусы задач в данных:', { 
            tasks: suspiciousTasks.map(t => ({ id: t.id, name: t.name })) 
          })
        }
        
        setTodos(fixedTodos)
        
      } catch (error) {
        logger.error('Ошибка при загрузке задач из БД', error)
        toast.error('Не удалось загрузить задачи')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTasksFromDB()
  }, [userId, viewMode, forceRefresh]) // Добавляем forceRefresh в зависимости

  // Обработчик обновления задачи из календаря
  const handleTodoUpdate = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ))
  }

  // Обработчик создания новой задачи
  const handleCreateTodo = (newTodo: Todo) => {
    setTodos(prev => [...prev, newTodo])
    setTaskName('')
  }

  // Функции для работы с дедлайном
  const addHoursToDeadline = (hours: number) => {
    setDeadline(current => addHours(current, hours))
  }

  const addDaysToDeadline = (days: number) => {
    setDeadline(current => addDays(current, days))
  }

  const setToday = () => {
    const today = new Date()
    today.setHours(new Date().getHours() + 2)
    today.setMinutes(0)
    today.setSeconds(0)
    setDeadline(today)
  }

  // Создание задачи
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
          notes: null,
          category: null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      toast.success('Задача создана!')
      handleCreateTodo(data)
      
    } catch (error) {
      console.error('Ошибка при создании задачи:', error)
      toast.error('Не удалось создать задачу')
    }
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
        <div className="container mx-auto px-4 py-4">
          {/* Заголовок и переключатель вида */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#E8D9C5]">Лайф-Кайф</h1>
              
              {/* Кнопка обновления данных */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleForceRefresh}
                className="p-2 rounded-full bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 text-[#E8D9C5]"
                title="Сбросить кеш и синхронизировать с базой"
              >
                <MdRefresh className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="flex bg-[#2A2A2A] rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
                    : 'bg-transparent text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
                }`}
              >
                <Icon icon="solar:list-bold" className="w-4 h-4" />
                <span className="text-sm">Список</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-[#E8D9C5]/20 text-[#E8D9C5]' 
                    : 'bg-transparent text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
                }`}
              >
                <Icon icon="solar:calendar-bold" className="w-4 h-4" />
                <span className="text-sm">Календарь</span>
              </motion.button>
            </div>
          </div>
          
          {/* Форма создания задачи встроенная в страницу */}
          <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6">
            <div className="flex gap-2">
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Что нужно сделать?"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && taskName.trim()) {
                    handleSave();
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={!taskName.trim()}
                className={`px-4 py-3 rounded-lg ${
                  taskName.trim() 
                    ? 'bg-[#E8D9C5] text-[#1A1A1A] hover:bg-[#D8C9B5]' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <MdAdd className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Строка с дедлайном */}
            {taskName.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-[#E8D9C5]/80">
                  <MdOutlineAccessTime className="w-4 h-4" />
                  <span className="text-sm">
                    {format(deadline, 'dd MMM, HH:mm', { locale: ru })}
                  </span>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => addHoursToDeadline(1)}
                    className="p-1 px-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
                  >
                    +1ч
                  </button>
                  <button 
                    onClick={() => addDaysToDeadline(1)}
                    className="p-1 px-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
                  >
                    +1д
                  </button>
                  <button 
                    onClick={setToday}
                    className="p-1 px-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
                  >
                    Сегодня
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Индикатор загрузки */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-t-transparent border-[#E8D9C5] rounded-full"
              />
            </div>
          ) : (
            /* Контент в зависимости от выбранного вида */
            viewMode === 'list' ? (
              <TodoList 
                initialTodos={todos} 
                onTodosChange={setTodos} 
                listView="vertical" 
                hideCompleted={true} 
              />
            ) : (
              <TaskCalendar 
                todos={todos} 
                onTodoUpdate={handleTodoUpdate} 
              />
            )
          )}
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
} 