'use client'

import TodoList from '../components/TodoList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import { useState, useEffect } from 'react'
import { Todo } from '@/types/todo'
import { TaskCalendar } from '../components/tasks/TaskCalendar'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

type ViewMode = 'list' | 'calendar'

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Обработчик обновления задачи из календаря
  const handleTodoUpdate = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ))
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
        <div className="container mx-auto px-4 py-4">
          {/* Заголовок и переключатель вида */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#E8D9C5]">Задачи</h1>
            
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
          
          {/* Контент в зависимости от выбранного вида */}
          {viewMode === 'list' ? (
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
          )}
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
} 