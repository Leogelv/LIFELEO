'use client'

import { useEffect, useState } from 'react'
import { UserIdProvider } from './contexts/UserContext'
import { HabitCard } from './components/habits/HabitCard'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TelegramScript from './components/TelegramScript'

const DEFAULT_USER_ID = 375634162

// Типизация для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        requestFullscreen: () => void;
        isVerticalSwipesEnabled: boolean;
        disableVerticalSwipes: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        addToHomeScreen: () => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        };
      };
    };
  }
}

export default function Home() {
  const [userId, setUserId] = useState<number>(DEFAULT_USER_ID)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Инициализация Telegram Mini App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      tg.requestFullscreen()
      tg.isVerticalSwipesEnabled = true
      tg.disableVerticalSwipes()
      tg.setHeaderColor('#1A1A1A')
      tg.setBackgroundColor('#1A1A1A')

      // Получаем данные пользователя
      if (tg.initDataUnsafe?.user) {
        setUserId(tg.initDataUnsafe.user.id)
        setUserData(tg.initDataUnsafe.user)
        console.log('Got Telegram user:', tg.initDataUnsafe.user)

        // Хаптик фидбек при загрузке
        tg.HapticFeedback.impactOccurred('medium')
      } else {
        console.log('Using default user ID:', DEFAULT_USER_ID)
      }
    }
  }, [])

  return (
    <UserIdProvider value={userId}>
      <TelegramScript />
      <main className="min-h-screen bg-[#1A1A1A] text-white p-4 md:p-8">
        {/* Анимированные градиенты на фоне */}
        <div className="fixed inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: ['-25%', '25%', '-25%'],
              y: ['-25%', '15%', '-25%'],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: ['25%', '-25%', '25%'],
              y: ['15%', '-25%', '15%'],
              scale: [1.2, 1, 1.2]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: ['-15%', '25%', '-15%'],
              y: ['25%', '-15%', '25%'],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Хедер */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-light text-[#E8D9C5]">Панель Смыслов</h1>
            <Link 
              href="/contacts" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8D9C5]/10 bg-[#E8D9C5]/5 backdrop-blur-sm hover:border-[#E8D9C5]/20 transition-all duration-500"
            >
              {userData?.photo_url ? (
                <img 
                  src={userData.photo_url} 
                  alt="Avatar" 
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <Icon icon="solar:users-group-rounded-outline" className="w-5 h-5 text-[#E8D9C5]" />
              )}
              <span className="text-[#E8D9C5]">
                {userData?.username ? `TG: @${userData.username}` : 'Контакты'}
              </span>
            </Link>
          </div>

          {/* Сетка привычек */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HabitCard 
              icon="solar:glass-water-bold"
              title="Вода"
              href="/habits/water"
              gradient="from-blue-500/40 to-cyan-400/30"
            />
            <HabitCard 
              icon="solar:dumbbell-small-bold"
              title="Спорт"
              href="/habits/sport"
              gradient="from-orange-500/40 to-red-400/30"
            />
            <HabitCard 
              icon="solar:moon-sleep-bold"
              title="Сон"
              href="/habits/sleep"
              gradient="from-indigo-500/40 to-purple-400/30"
            />
            <HabitCard 
              icon="solar:checklist-minimalistic-bold"
              title="Задачи"
              href="/habits/tasks"
              gradient="from-green-500/40 to-emerald-400/30"
            />
            <HabitCard 
              icon="solar:meditation-bold"
              title="Медитация"
              href="/habits/meditation"
              gradient="from-purple-500/40 to-blue-400/30"
            />
            <HabitCard 
              icon="solar:wallet-bold"
              title="Финансы"
              href="/habits/finance"
              gradient="from-yellow-500/40 to-amber-400/30"
            />
          </div>

          {/* Кнопка "На домашний экран" */}
          <button
            onClick={() => window.Telegram?.WebApp.addToHomeScreen()}
            className="mx-auto mt-12 block px-4 py-2 text-sm text-[#E8D9C5]/70 border border-[#E8D9C5]/10 rounded-xl hover:border-[#E8D9C5]/20 transition-all duration-500"
          >
            На домашний экран
          </button>
        </div>
      </main>
    </UserIdProvider>
  )
}
