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
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

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
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [telegramChats, setTelegramChats] = useState<TelegramChat[]>([])
  
  // Добавляем состояние для поиска
  const [searchTerm, setSearchTerm] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAnalyzedOnly, setShowAnalyzedOnly] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

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

  // Функция для фильтрации контактов по поисковому запросу
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
    .filter(contact => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      // Проверяем все возможные поля, где может быть имя или никнейм
      const firstNameMatch = contact.first_name?.toLowerCase().includes(searchLower) || false;
      const lastNameMatch = contact.last_name?.toLowerCase().includes(searchLower) || false;
      const usernameMatch = contact.username?.toLowerCase().includes(searchLower) || false;
      const telegramIdMatch = String(contact.telegram_id).includes(searchTerm);
      
      return firstNameMatch || lastNameMatch || usernameMatch || telegramIdMatch;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Поиск */}
      <div className="mb-4 relative">
        <div className="relative rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Поиск по имени или никнейму..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          />
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
            width={20}
            height={20}
          />
          {searchTerm && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70"
            >
              <Icon icon="solar:close-circle-linear" width={18} height={18} />
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            onClick={() => setShowAnalyzedOnly(!showAnalyzedOnly)}
            className={`
              mr-4 px-3 py-1 rounded-lg text-sm transition-colors
              ${showAnalyzedOnly ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-white/70'}
            `}
          >
            Только с анализом
          </button>
        </div>
        
        <div className="flex gap-1">
          <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors">
            <span className={`block w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}>
              <Icon icon="solar:refresh-linear" width={20} height={20} />
            </span>
          </button>
          <Link href="/contacts/import" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className="block w-5 h-5">
              <Icon icon="solar:import-linear" width={20} height={20} />
            </span>
          </Link>
        </div>
      </div>
      
      <div className="flex mb-4 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab(0)}
          className={`
            flex-1 py-2 rounded-md text-sm transition-colors
            ${selectedTab === 0 ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/70'}
          `}
        >
          Личные ({contacts.filter(c => !c.is_group).length})
        </button>
        <button
          onClick={() => setSelectedTab(1)}
          className={`
            flex-1 py-2 rounded-md text-sm transition-colors
            ${selectedTab === 1 ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/70'}
          `}
        >
          Группы ({contacts.filter(c => c.is_group).length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredContacts.length === 0 && (
          <div className="text-center py-8 text-white/50">
            {searchTerm ? 'Контакты не найдены' : 'Нет контактов'}
          </div>
        )}
        
        {filteredContacts.map(contact => (
          <div key={contact.user_id} className="flex items-center space-x-2">
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
        ))}
      </div>
    </div>
  )
} 