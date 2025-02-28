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
  const { user, isTelegramWebApp } = useTelegram()

  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-8">
          {/* Заголовок и приветствие */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">LIFELEO</h1>
            <p className="text-[#E8D9C5]/80">
              Привет, {user?.firstName || 'Гость'}! Добро пожаловать в твой личный органайзер.
            </p>
          </div>

          {/* Основные разделы */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/tasks" className="block">
              <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mr-4">
                    <Icon icon="solar:checklist-minimalistic-bold" className="w-6 h-6 text-[#E8D9C5]" />
                  </div>
                  <h2 className="text-xl font-semibold">Задачи</h2>
                </div>
                <p className="text-[#E8D9C5]/70">Управляй своими задачами, устанавливай приоритеты и отслеживай прогресс.</p>
              </div>
            </Link>

            <Link href="/habits" className="block">
              <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mr-4">
                    <Icon icon="solar:star-bold" className="w-6 h-6 text-[#E8D9C5]" />
                  </div>
                  <h2 className="text-xl font-semibold">Привычки</h2>
                </div>
                <p className="text-[#E8D9C5]/70">Формируй полезные привычки и отслеживай свой прогресс день за днем.</p>
              </div>
            </Link>

            <Link href="/contacts" className="block">
              <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mr-4">
                    <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6 text-[#E8D9C5]" />
                  </div>
                  <h2 className="text-xl font-semibold">Контакты</h2>
                </div>
                <p className="text-[#E8D9C5]/70">Управляй своими контактами и поддерживай связь с важными людьми.</p>
              </div>
            </Link>

            {!isTelegramWebApp && (
              <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#E8D9C5]/10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mr-4">
                    <Icon icon="solar:info-circle-bold" className="w-6 h-6 text-[#E8D9C5]" />
                  </div>
                  <h2 className="text-xl font-semibold">О приложении</h2>
                </div>
                <p className="text-[#E8D9C5]/70">
                  LIFELEO - это приложение для управления задачами, привычками и контактами. 
                  Доступно как в браузере, так и в Telegram.
                </p>
              </div>
            )}
          </div>
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
}