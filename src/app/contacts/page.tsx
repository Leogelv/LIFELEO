'use client'

import { useEffect, useState } from 'react'
import { UserIdContext } from '../contexts/UserContext'
import { useContext } from 'react'
import { supabase } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { MdArrowBack } from 'react-icons/md'
import Link from 'next/link'
import { ContactList } from '../components/ContactList'
import { TelegramLayout } from '../components/layouts/TelegramLayout'

interface Contact {
  id: number
  user_id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  created_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const userId = useContext(UserIdContext)

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('telegram_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contacts:', error)
      } else {
        setContacts(data || [])
      }
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
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
          className="space-y-4"
        >
          <ContactList contacts={contacts} />
        </motion.div>
      </div>
    </TelegramLayout>
  )
} 