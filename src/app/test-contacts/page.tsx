'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/utils/logger'

interface Chat {
  chat_id: number
  title: string
  username: string | null
  last_message: string | null
  chat_type: string
  members_count: number
}

interface ApiResponse {
  success: boolean
  private_chats_count: number
  group_chats_count: number
  private_chats: Chat[]
  group_chats: Chat[]
}

export default function TestContacts() {
  const [personalChats, setPersonalChats] = useState<Chat[]>([])
  const [groupChats, setGroupChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchContacts() {
    try {
      setLoading(true)
      const response = await fetch('/api/test-contacts')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      console.log('Raw response:', data)

      if (!data.success) {
        throw new Error('API returned unsuccessful response')
      }

      setPersonalChats(data.private_chats || [])
      setGroupChats(data.group_chats || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded">
          Error: {error}
        </div>
        <button 
          onClick={fetchContacts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Тестовая страница контактов</h1>
        <button 
          onClick={fetchContacts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Личные чаты */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            Личные чаты ({personalChats.length})
          </h2>
          <div className="space-y-4">
            {personalChats.map(chat => (
              <div key={chat.chat_id} className="p-4 bg-gray-800 rounded">
                <div className="font-medium">{chat.title}</div>
                {chat.username && (
                  <div className="text-sm text-gray-400">@{chat.username}</div>
                )}
                {chat.last_message && (
                  <div className="mt-2 text-sm text-gray-300 truncate">{chat.last_message}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Групповые чаты */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            Групповые чаты ({groupChats.length})
          </h2>
          <div className="space-y-4">
            {groupChats.map(chat => (
              <div key={chat.chat_id} className="p-4 bg-gray-800 rounded">
                <div className="font-medium">{chat.title}</div>
                {chat.username && (
                  <div className="text-sm text-gray-400">@{chat.username}</div>
                )}
                <div className="text-sm text-gray-400">
                  {chat.members_count} участников
                </div>
                {chat.last_message && (
                  <div className="mt-2 text-sm text-gray-300 truncate">{chat.last_message}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Raw Response:</h3>
        <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify({
            private_chats: personalChats,
            group_chats: groupChats
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
} 