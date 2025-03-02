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
import { BottomMenu } from './components/BottomMenu'

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
  const { user, isTelegramWebApp, safeAreaInset } = useTelegram()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Обновляем время каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Получаем приветствие в зависимости от времени суток
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-8">
          {/* Заголовок и приветствие */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">LIFELEO</h1>
              <div className="text-right">
                <p className="text-[#E8D9C5]/60 text-sm">
                  {currentTime.toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-[#E8D9C5]/80 text-lg font-medium">
                  {currentTime.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#E8D9C5]/10">
              <p className="text-2xl font-medium mb-2">
                {getGreeting()}, {user?.firstName || 'Гость'}!
              </p>
              <p className="text-[#E8D9C5]/70">
                Что будем делать сегодня?
              </p>
            </div>
          </div>

          {/* Основные разделы - первый ряд */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Link href="/tasks" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-xl p-5 border border-rose-500/20 hover:border-rose-500/30 transition-all h-full"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center mr-3">
                    <Icon icon="solar:checklist-minimalistic-bold" className="w-5 h-5 text-rose-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-rose-400">Задачи</h2>
                </div>
                <p className="text-[#E8D9C5]/70 text-sm">Управляй задачами и отслеживай прогресс</p>
              </motion.div>
            </Link>

            <Link href="/habits" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/30 transition-all h-full"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <Icon icon="solar:star-bold" className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-purple-400">Привычки</h2>
                </div>
                <p className="text-[#E8D9C5]/70 text-sm">Формируй полезные привычки</p>
              </motion.div>
            </Link>
          </div>

          {/* Основные разделы - второй ряд */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Link href="/notes" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-5 border border-amber-500/20 hover:border-amber-500/30 transition-all h-full"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                    <Icon icon="solar:notes-bold" className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-amber-400">Заметки</h2>
                </div>
                <p className="text-[#E8D9C5]/70 text-sm">Создавай и анализируй заметки с ИИ</p>
              </motion.div>
            </Link>

            <Link href="/contacts" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-5 border border-cyan-500/20 hover:border-cyan-500/30 transition-all h-full"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                    <Icon icon="solar:users-group-rounded-bold" className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-cyan-400">Контакты</h2>
                </div>
                <p className="text-[#E8D9C5]/70 text-sm">Управляй контактами</p>
              </motion.div>
            </Link>
          </div>

          {/* Голосовой бот */}
          <Link href="/voicebot" className="block mb-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-5 border border-emerald-500/20 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                  <Icon icon="solar:microphone-bold" className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-emerald-400">Голосовой бот</h2>
              </div>
              <p className="text-[#E8D9C5]/70">Общайся с ИИ-ассистентом голосом и получай помощь в решении задач</p>
            </motion.div>
          </Link>

          {/* Дополнительные функции */}
          <div className="grid grid-cols-3 gap-4">
            <Link href="/settings" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2A2A2A] rounded-xl p-4 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all h-full"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mb-2">
                    <Icon icon="solar:settings-bold" className="w-5 h-5 text-[#E8D9C5]" />
                  </div>
                  <h3 className="text-sm font-medium">Настройки</h3>
                </div>
              </motion.div>
            </Link>

            <Link href="/stats" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2A2A2A] rounded-xl p-4 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all h-full"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mb-2">
                    <Icon icon="solar:chart-bold" className="w-5 h-5 text-[#E8D9C5]" />
                  </div>
                  <h3 className="text-sm font-medium">Статистика</h3>
                </div>
              </motion.div>
            </Link>

            <Link href="/help" className="block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2A2A2A] rounded-xl p-4 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all h-full"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mb-2">
                    <Icon icon="solar:question-circle-bold" className="w-5 h-5 text-[#E8D9C5]" />
                  </div>
                  <h3 className="text-sm font-medium">Помощь</h3>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
}