'use client'

import TodoList from '../components/TodoList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import { useState, useEffect } from 'react'
import { Todo } from '@/types/todo'
import { TaskCalendar } from '../components/tasks/TaskCalendar'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { useContext } from 'react'
import { UserIdContext } from '@/app/contexts/UserContext'
import { logger } from '@/utils/logger'
import { toast } from 'sonner'
import { CreateTodoModal } from '@/app/components/CreateTodoModal'

type ViewMode = 'list' | 'calendar'

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const userId = useContext(UserIdContext)

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
        
        setTodos(data || [])
        
      } catch (error) {
        logger.error('Ошибка при загрузке задач из БД', error)
        toast.error('Не удалось загрузить задачи')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTasksFromDB()
  }, [userId, viewMode]) // Перезагрузка при переключении вида для синхронизации

  // Обработчик обновления задачи из календаря
  const handleTodoUpdate = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ))
  }

  // Обработчик создания новой задачи
  const handleCreateTodo = (newTodo: Todo) => {
    setTodos(prev => [...prev, newTodo])
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
        <div className="container mx-auto px-4 py-4">
          {/* Заголовок и переключатель вида */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#E8D9C5]">Задачи</h1>
              
              {/* Кнопка создания задачи */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2 rounded-full bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 text-[#E8D9C5]"
                title="Создать задачу"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
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

      {/* Модальное окно создания задачи */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateTodoModal
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateTodo}
          />
        )}
      </AnimatePresence>
    </>
  )
} 