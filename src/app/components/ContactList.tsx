'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Contact } from '@/types/contacts'
import Link from 'next/link'
import { logger } from '@/utils/logger'
import { Tab } from '@headlessui/react'
import { toast } from 'sonner'
import { getContacts } from '@/app/actions/contacts'

declare global {
  interface Window {
    ENV: {
      NEXT_PUBLIC_YANDEX_API_KEY: string
    }
  }
}

// Массив крутых градиентов
const gradients = [
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-green-400 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-yellow-400 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-purple-500'
]

// Получаем случайный градиент
const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)]
}

interface TelegramChat {
  chat_id: number
  title: string
  username: string | null
  last_message: string | null
  chat_type: string
  members_count: number
  is_pinned: boolean
  unread_count: number
  last_message_date?: string
}

interface TelegramResponse {
  success: boolean
  private_chats: TelegramChat[]
  group_chats: TelegramChat[]
  private_chats_count: number
  group_chats_count: number
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAnalyzedOnly, setShowAnalyzedOnly] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    logger.info('ContactList компонент инициализирован')
    fetchContacts()

    // Создаем канал для real-time обновлений
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts_userbot_leo'
        },
        (payload) => {
          logger.debug('🔄 Получено обновление контакта', { payload })
          setContacts(current => 
            current.map(contact => 
              contact.user_id === payload.new.user_id 
                ? { ...contact, ...payload.new }
                : contact
            )
          )
        }
      )
      .subscribe()

    return () => {
      logger.debug('Отписываемся от обновлений контактов')
      supabase.removeChannel(channel)
    }
  }, [supabase])

  async function fetchContacts() {
    const startTime = performance.now()
    logger.debug('Начинаем загрузку контактов')

    try {
      const { data, error } = await supabase
        .from('contacts_userbot_leo')
        .select(`
          user_id,
          first_name,
          last_name,
          username,
          last_message,
          is_pinned,
          summary,
          is_group,
          members_count,
          unread_count,
          last_message_date
        `)
        .order('is_pinned', { ascending: false })
        .order('last_message_date', { ascending: false })

      if (error) {
        logger.error('Ошибка при загрузке контактов:', { error })
        throw error
      }

      const endTime = performance.now()
      logger.info('✅ Контакты успешно загружены', { 
        count: data?.length,
        timeMs: Math.round(endTime - startTime)
      })

      setContacts(data || [])
    } catch (error) {
      logger.error('Неожиданная ошибка при загрузке контактов:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    logger.debug('🔄 Запускаем обновление контактов')

    try {
      const response = await fetch('/api/contacts', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as TelegramResponse
      
      // Обновляем все контакты
      const allContacts = [
        ...(data.private_chats || []).map((chat: TelegramChat) => ({
          user_id: chat.chat_id,
          first_name: chat.title || chat.username || 'Без имени',
          last_name: '',
          username: chat.username || '',
          last_message: chat.last_message || '',
          is_pinned: chat.is_pinned || false,
          is_group: false,
          members_count: 2,
          unread_count: chat.unread_count || 0,
          last_message_date: chat.last_message_date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        ...(data.group_chats || []).map((chat: TelegramChat) => ({
          user_id: chat.chat_id,
          first_name: chat.title || 'Групповой чат',
          last_name: '',
          username: chat.username || '',
          last_message: chat.last_message || '',
          is_pinned: chat.is_pinned || false,
          is_group: true,
          members_count: chat.members_count || 0,
          unread_count: chat.unread_count || 0,
          last_message_date: chat.last_message_date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      ]

      // Используем проверенный метод upsert
      const { error } = await supabase
        .from('contacts_userbot_leo')
        .upsert(allContacts, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        })

      if (error) {
        throw error
      }

      toast.success(`Обновлено ${allContacts.length} контактов`, {
        duration: 3000,
        icon: '✨'
      })

      // Перезагружаем список
      fetchContacts()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      console.error('❌ Критическая ошибка при обновлении:', errorMessage)
      toast.error(`Не удалось обновить контакты: ${errorMessage}`, {
        duration: 5000,
        icon: '💥'
      })
    } finally {
      setRefreshing(false)
    }
  }

  const filteredContacts = contacts
    .filter(contact => {
      if (showAnalyzedOnly) {
        return contact.summary || contact.history?.analysis
      }
      return true
    })
    .filter(contact => {
      // Фильтруем по типу чата (личный/групповой)
      return selectedTab === 0 ? !contact.is_group : contact.is_group
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Загрузка контактов...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-900/50 p-1">
            <Tab
              className={({ selected }) =>
                `w-12 h-12 rounded-lg flex items-center justify-center
                ${selected 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-12 h-12 rounded-lg flex items-center justify-center
                ${selected 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </Tab>
          </Tab.List>
        </Tab.Group>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`w-12 h-12 rounded-lg flex items-center justify-center
            bg-gradient-to-r from-emerald-500 to-teal-500 text-white
            transform hover:scale-105 transition-all duration-200 hover:shadow-lg
            hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 
            focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${refreshing ? 'animate-pulse' : ''}`}
        >
          {refreshing ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showAnalyzedOnly}
            onChange={(e) => setShowAnalyzedOnly(e.target.checked)}
            className="form-checkbox h-5 w-5 bg-transparent border-2 border-indigo-500 rounded-md 
              checked:bg-indigo-500 checked:border-transparent focus:ring-0 
              transition-colors duration-200"
          />
          <span className="ml-2 text-gray-200">
             только проанализированные 
          </span>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl bg-gray-900/50 backdrop-blur-xl border border-gray-800">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredContacts.map((contact) => (
              <tr key={contact.user_id} className="hover:bg-gray-800/50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br ${getRandomGradient()} 
                      shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-200`}>
                      <span className="text-lg font-medium text-white">
                        {contact.first_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">
                          {contact.first_name} {contact.last_name}
                        </span>
                        {contact.is_pinned && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                            Закреплен
                          </span>
                        )}
                        {contact.unread_count && contact.unread_count > 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {contact.username ? `@${contact.username}` : ''}
                        {contact.is_group && contact.members_count ? (
                          <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded-full text-xs">
                            {contact.members_count} участников
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300 max-w-xs truncate">
                    {contact.last_message}
                  </div>
                  {contact.last_message_date && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(contact.last_message_date).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/contacts/${contact.user_id}`}
                    className="inline-flex items-center px-4 py-2 rounded-full 
                      bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium
                      transform hover:scale-105 transition-all duration-200 hover:shadow-lg
                      hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 
                      focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Открыть карточку
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 