'use client'

import { useEffect, useState } from 'react'
import { MdArrowBack } from 'react-icons/md'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { TelegramLayout } from '@/app/components/layouts/TelegramLayout'
import { ContactList } from '@/app/components/ContactList'

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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('375634162') // Дефолтный userId

  useEffect(() => {
    // Проверяем наличие Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      // Здесь можно получить userId из Telegram WebApp
      // setUserId(tg.initDataUnsafe?.user?.id)
    }

    const fetchContacts = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contacts:', error)
        return
      }

      setContacts(data || [])
      setLoading(false)
    }

    fetchContacts()
  }, [userId])

  return (
    <TelegramLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="py-6"
        >
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
                  bg-white/5 hover:bg-white/10 transition-colors"
              >
                <MdArrowBack className="w-6 h-6" />
                <span>Назад</span>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Контакты
              </h1>
            </motion.div>
            <div className="w-[88px]" />
          </div>
        </motion.div>

        {/* Contact List */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {loading ? (
            <div className="text-center text-gray-400">Загрузка контактов...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center text-gray-400">Нет контактов</div>
          ) : (
            <ContactList contacts={contacts} />
          )}
        </motion.div>
      </div>
    </TelegramLayout>
  )
} 