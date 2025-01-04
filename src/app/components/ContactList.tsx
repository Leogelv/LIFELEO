'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Contact {
  id: number
  user_id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  created_at: string
  last_message?: string
  is_pinned?: boolean
  summary?: string
  history?: {
    analysis?: string
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

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnalyzedOnly, setShowAnalyzedOnly] = useState(false)
  const supabase = createClient()

  useEffect(() => {
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
          console.log('🔄 Change received!', payload)
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
      supabase.removeChannel(channel)
    }
  }, [supabase])

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts_userbot_leo')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('last_message', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = showAnalyzedOnly 
    ? contacts.filter(contact => contact.summary || contact.history?.analysis)
    : contacts

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
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
            Показать только проанализированные контакты
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
              <tr key={contact.id} className="hover:bg-gray-800/50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br ${getRandomGradient()} 
                      shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-200`}>
                      <span className="text-lg font-medium text-white">
                        {contact.first_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-200">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-sm text-gray-400">
                        @{contact.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300 max-w-xs truncate">
                    {contact.last_message}
                  </div>
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