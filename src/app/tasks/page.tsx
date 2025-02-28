'use client'

import TodoList from '../components/TodoList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import { useState } from 'react'
import { Todo } from '@/types/todo'

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([])

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] overflow-x-hidden">
        <TodoList 
          initialTodos={todos} 
          onTodosChange={setTodos} 
          listView="vertical" 
          hideCompleted={true} 
        />
      </SafeArea>
      <BottomMenu />
    </>
  )
} 