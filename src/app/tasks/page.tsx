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
import { useUserId } from '@/app/contexts/UserIdContext'
import { useTelegram } from '../hooks/useTelegram'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { format, addHours, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MdOutlineCalendarToday, MdAdd, MdOutlineAccessTime, MdRefresh, MdCategory, MdOutlineSubtitles, MdOutlineNotes, MdCheck, MdClose, MdDelete, MdArrowBack } from 'react-icons/md'
import Link from 'next/link'

type ViewMode = 'list' | 'calendar'

interface Subtask {
  id: string
  todo_id: string
  name: string
  done: boolean
  created_at: string
}

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [forceRefresh, setForceRefresh] = useState(0) // Счетчик для принудительного обновления
  
  // Получаем userId из нескольких источников
  const oldContextUserId = useContext(UserIdContext)
  const { userId: telegramUserId, isInitialized } = useTelegram()
  const contextUserId = useUserId()
  
  // Получаем userId напрямую из URL в крайнем случае
  const getDirectUserId = () => {
    if (typeof window === 'undefined') return 0;
    
    const urlMatch = window.location.href.match(/(\d{6,})/);
    if (urlMatch) {
      return parseInt(urlMatch[0], 10);
    }
    return 0;
  }
  
  const directUserId = getDirectUserId();
  
  // Определяем эффективный userId с приоритетом
  const effectiveUserId = contextUserId || oldContextUserId || telegramUserId || directUserId;
  
  useEffect(() => {
    console.log('🧪 TasksPage: userId из старого контекста =', oldContextUserId);
    console.log('🧪 TasksPage: userId из нового контекста =', contextUserId);
    console.log('🧪 TasksPage: userId из telegram =', telegramUserId);
    console.log('🧪 TasksPage: directUserId =', directUserId);
    console.log('🧪 TasksPage: используем effectiveUserId =', effectiveUserId);
    console.log('🧪 TasksPage: isInitialized =', isInitialized);
  }, [oldContextUserId, contextUserId, telegramUserId, directUserId, effectiveUserId, isInitialized]);

  const [taskName, setTaskName] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [deadline, setDeadline] = useState<Date>(new Date())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskName, setNewSubtaskName] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Инициализируем список категорий
  const categories = [
    { id: 'water', name: 'Вода', icon: 'solar:glass-water-bold' },
    { id: 'sport', name: 'Спорт', icon: 'solar:running-round-bold' },
    { id: 'meditation', name: 'Медитация', icon: 'solar:meditation-bold' },
    { id: 'breathing', name: 'Дыхание', icon: 'solar:breathing-bold' },
    { id: 'work', name: 'Работа', icon: 'solar:laptop-bold' },
    { id: 'home', name: 'Дом', icon: 'solar:home-2-bold' },
    { id: 'finance', name: 'Финансы', icon: 'solar:wallet-money-bold' }
  ]

  // Функция принудительного обновления
  const handleForceRefresh = () => {
    toast.info('Очистка кеша и синхронизация с базой...')
    logger.info('Принудительное обновление данных из базы и очистка кеша')
    setForceRefresh(prev => prev + 1) // Инкрементируем счетчик для триггера useEffect
  }

  // Загрузка задач напрямую из БД при инициализации и переключении вида
  useEffect(() => {
    // Если нет userId или приложение не инициализировано (пароль не введен), выходим
    if (!effectiveUserId || !isInitialized) {
      console.log('⚠️ Нет userId или пароль не введен, задачи не будут загружены');
      return;
    }
    
    const loadTasksFromDB = async () => {
      setIsLoading(true)
      
      try {
        console.log('🔍 Загрузка задач для userId:', effectiveUserId);
        logger.info('Загрузка задач напрямую из БД')
        
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('telegram_id', effectiveUserId)
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
  }, [effectiveUserId, viewMode, forceRefresh, isInitialized]) // Добавляем isInitialized в зависимости

  // Обработчик обновления задачи из календаря
  const handleTodoUpdate = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ))
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

  // Обработка добавления подзадачи
  const handleAddSubtask = () => {
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
  const toggleSubtask = (subtaskId: string) => {
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

  // Очистка формы
  const resetForm = () => {
    setTaskName('')
    setNotes('')
    setCategory(undefined)
    setDeadline(new Date())
    setSubtasks([])
    setShowAdvanced(false)
  }

  // Создание задачи
  const handleSave = async () => {
    if (!taskName.trim() || !effectiveUserId) return
    
    try {
      logger.info('Создание новой задачи:', { 
        name: taskName,
        hasSubtasks: subtasks.length > 0,
        hasNotes: !!notes
      })
      
      // Создаем основную задачу
      const { data, error } = await supabase
        .from('todos')
        .insert({
          name: taskName,
          deadline: deadline.toISOString(),
          telegram_id: effectiveUserId,
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
          logger.error('Ошибка при создании подзадач:', subtasksError)
          toast.error('Задача создана, но возникли проблемы с подзадачами')
        }
      }
      
      // Добавляем задачу в локальное состояние и очищаем форму
      setTodos(prev => [...prev, data])
      resetForm()
      toast.success('Задача создана!')
      
    } catch (error) {
      logger.error('Ошибка при создании задачи:', error)
      toast.error('Не удалось создать задачу')
    }
  }

  // Обработчик отправки по Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showAdvanced && document.activeElement?.id === 'newSubtaskInput') {
        handleAddSubtask();
      } else if (taskName.trim()) {
        handleSave();
      }
      e.preventDefault();
    }
  };

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
        <div className="container mx-auto px-4 py-4">
          {/* Заголовок и переключатель вида */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Кнопка навигации назад */}
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 text-[#E8D9C5] mr-2"
                  title="Назад на главную"
                >
                  <MdArrowBack className="w-5 h-5" />
                </motion.button>
              </Link>
              
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
                id="taskNameInput"
                ref={nameInputRef}
                type="text"
                placeholder="Что нужно сделать?"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onKeyDown={handleKeyDown}
                onFocus={() => taskName.trim() && setShowAdvanced(true)}
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
            
            {/* Расширенная форма - появляется при активном вводе или по кнопке */}
            <AnimatePresence>
              {(taskName.trim() || showAdvanced) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  {/* Строка с дедлайном */}
                  <div className="flex items-center justify-between">
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
                  </div>
                  
                  {/* Выбор категории */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(category === cat.id ? undefined : cat.id)}
                        className={`flex items-center gap-1 p-1.5 rounded-md text-xs ${
                          category === cat.id
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <Icon icon={cat.icon} className="w-4 h-4" />
                        <span>{cat.name}</span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Ввод заметки */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-[#E8D9C5]/80">
                      <MdOutlineNotes className="w-4 h-4" />
                      <span className="text-sm">Заметка</span>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 min-h-[80px] resize-y"
                      placeholder="Добавьте дополнительные детали..."
                    />
                  </div>
                  
                  {/* Подзадачи */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[#E8D9C5]/80">
                        <MdOutlineSubtitles className="w-4 h-4" />
                        <span className="text-sm">Подзадачи ({subtasks.length})</span>
                      </div>
                    </div>
                    
                    {/* Список существующих подзадач */}
                    {subtasks.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                            <button
                              onClick={() => toggleSubtask(subtask.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full ${
                                subtask.done ? 'bg-green-500 text-white' : 'bg-gray-700'
                              }`}
                            >
                              {subtask.done && <MdCheck className="w-5 h-5" />}
                            </button>
                            <span className={`flex-1 text-sm ${subtask.done ? 'line-through text-gray-500' : 'text-white'}`}>
                              {subtask.name}
                            </span>
                            <button
                              onClick={() => deleteSubtask(subtask.id)}
                              className="text-gray-500 hover:text-gray-300"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Ввод новой подзадачи */}
                    <div className="flex gap-2">
                      <input
                        id="newSubtaskInput"
                        type="text"
                        value={newSubtaskName}
                        onChange={(e) => setNewSubtaskName(e.target.value)}
                        placeholder="Добавить подзадачу..."
                        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        onKeyDown={handleKeyDown}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddSubtask}
                        disabled={!newSubtaskName.trim()}
                        className={`p-2 rounded-lg ${
                          newSubtaskName.trim()
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <MdAdd className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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