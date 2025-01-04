'use client'

// Импортируем клиент Supabase для работы с базой данных
import { createClient } from '@/utils/supabase/client'
// Импортируем хуки React для управления состоянием и эффектами
import { useEffect, useState } from 'react'

// Определяем тип для задачи (Todo)
type Todo = {
  id: string        // Уникальный идентификатор задачи
  name: string      // Название задачи
  done: boolean     // Статус выполнения
  date: string      // Дата создания
}

// Основной компонент списка задач
export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  // Создаем состояние для хранения списка задач
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  // Инициализируем клиент Supabase
  const supabase = createClient()

  useEffect(() => {
    // Создаем канал для real-time обновлений
    const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Change received!', payload)
          // Обрабатываем добавление новой задачи
          if (payload.eventType === 'INSERT') {
            setTodos(current => [...current, payload.new as Todo])
          } 
          // Обрабатываем удаление задачи
          else if (payload.eventType === 'DELETE') {
            setTodos(current => current.filter(todo => todo.id !== payload.old.id))
          } 
          // Обрабатываем обновление задачи
          else if (payload.eventType === 'UPDATE') {
            setTodos(current => 
              current.map(todo => 
                todo.id === payload.new.id ? payload.new as Todo : todo
              )
            )
          }
        }
      )
      .subscribe()

    // Отписываемся от канала при размонтировании компонента
    return () => {
      channels.unsubscribe()
    }
  }, [supabase])

  return (
    // Рендерим список задач с отступами между элементами
    <ul className="space-y-2">
      {todos?.map((todo) => (
        // Каждая задача - это элемент списка с градиентным фоном и анимацией при наведении
        <li key={todo.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-lg hover:from-gray-800/50 hover:to-gray-900/50 transition-all duration-300 shadow-lg backdrop-blur-sm">
          {/* Чекбокс для отметки выполнения задачи */}
          <input 
            type="checkbox" 
            checked={todo.done}
            onChange={async () => {
              // Обновляем статус задачи в базе данных
              const { error } = await supabase
                .from('todos')
                .update({ done: !todo.done })
                .eq('id', todo.id)
              
              if (error) console.error('Error updating todo:', error)
            }}
            className="w-5 h-5 rounded-md border-gray-600 focus:ring-purple-500 text-purple-500 transition-all duration-200"
          />
          {/* Название задачи с зачеркиванием, если задача выполнена */}
          <span className={`flex-1 ${todo.done ? 'line-through text-gray-500' : 'text-gray-200'} transition-all duration-200`}>
            {todo.name}
          </span>
          {/* Блок с датой и временем создания задачи */}
          <div className="flex flex-col items-end text-xs">
            {/* Форматируем и выводим дату */}
            <span className="text-purple-400">{new Date(todo.date).toLocaleDateString('ru-RU', { 
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}</span>
            {/* Форматируем и выводим время */}
            <span className="text-gray-500">{new Date(todo.date).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </li>
      ))}
    </ul>
  )
} 