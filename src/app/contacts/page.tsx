'use client'

import Link from 'next/link'
import { ContactList } from '../components/ContactList'
import { useTelegram } from '../hooks/useTelegram'

export default function ContactsPage() {
  const { isExpanded } = useTelegram()

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 ${isExpanded ? 'pt-[100px]' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-gray-800/40 backdrop-blur-xl border border-gray-700/50
              hover:bg-gray-700/40 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span>Назад</span>
          </Link>
          <h1 className="text-2xl font-bold">Контакты</h1>
        </div>
        <ContactList />
      </div>
    </div>
  )
} 