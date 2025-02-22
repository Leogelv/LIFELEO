'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/utils/logger'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram } from './hooks/useTelegram'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { realtime } from '@/utils/realtime'
import { habitsRealtime } from '@/utils/habits-realtime'
import { SafeArea } from './components/SafeArea'

interface TaskStats {
  overdue: number
  completed: number
  total: number
}

interface HabitStats {
  completedToday: number
  totalHabits: number
  streak: number
}

interface ContactStats {
  totalContacts: number
  activeChats: number
}

const menuItems = [
  {
    href: '/tasks',
    title: 'Tasks',
    description: 'Управляйте задачами',
    icon: 'game-icons:tied-scroll',
    gradient: 'from-rose-400 to-pink-400'
  },
  {
    href: '/habits',
    title: 'Habits',
    description: 'Отслеживайте привычки',
    icon: 'game-icons:meditation',
    gradient: 'from-purple-400 to-indigo-400'
  },
  {
    href: '/contacts',
    title: 'Contacts',
    description: 'Управляйте контактами',
    icon: 'game-icons:discussion',
    gradient: 'from-cyan-400 to-blue-400'
  }
]

export default function Home() {
  const { userPhoto, userName } = useTelegram()
  const [activeTab, setActiveTab] = useState('home')

  return (
    <SafeArea className="min-h-screen bg-zinc-900 text-white">
      {/* Header с аватаркой */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3 p-4">
          {userPhoto && (
            <img 
              src={userPhoto} 
              alt={userName}
              className="w-10 h-10 rounded-full border border-white/20"
            />
          )}
          <div className="font-light">
            <div className="text-white/60 text-sm">Привет,</div>
            <div className="text-white">{userName || 'Друг'}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[85px] pb-[80px]">
        <div className="px-4 py-6 space-y-6">
          {menuItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`
                  p-6 rounded-2xl bg-gradient-to-br ${item.gradient}
                  border border-white/20 relative overflow-hidden
                `}
              >
                <div className="flex items-start gap-4">
                  <Icon icon={item.icon} className="w-8 h-8 shrink-0" />
                  <div>
                    <h2 className="text-xl font-light">{item.title}</h2>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around p-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'home' ? 'text-white' : 'text-white/60'
            }`}
          >
            <Icon icon="solar:home-2-bold" className="w-6 h-6" />
            <span className="text-xs">Главная</span>
          </button>

          <Link 
            href="https://kpcaller2.vercel.app"
            target="_blank"
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'voice' ? 'text-white' : 'text-white/60'
            }`}
            onClick={() => setActiveTab('voice')}
          >
            <Icon icon="solar:microphone-bold" className="w-6 h-6" />
            <span className="text-xs">Голос</span>
          </Link>
        </div>
      </nav>
    </SafeArea>
  )
}