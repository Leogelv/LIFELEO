'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GlowingParticles } from './components/ui/GlowingParticles'
import { RiMentalHealthLine, RiMoneyDollarCircleLine } from 'react-icons/ri'
import { GiMuscleUp } from 'react-icons/gi'
import { IoWaterOutline } from 'react-icons/io5'
import { BsMoonStars } from 'react-icons/bs'
import { MdOutlineContactPage, MdOutlineTaskAlt } from 'react-icons/md'
import Script from 'next/script'

// Глобальный тип для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
          };
        };
      };
    };
  }
}

// Создаем контекст для userId
import { createContext, useContext } from 'react'
export const UserIdContext = createContext<number>(375634162) // Дефолтный ID

const habits = [
  {
    name: 'Медитация',
    icon: RiMentalHealthLine,
    href: '/habits/meditation',
    progress: '120 / 120 мин',
    color: 'from-purple-400/20 to-fuchsia-400/20'
  },
  {
    name: 'Спорт',
    icon: GiMuscleUp,
    href: '/habits/sport',
    color: 'from-emerald-400/20 to-green-400/20'
  },
  {
    name: 'Вода',
    icon: IoWaterOutline,
    href: '/habits/water',
    color: 'from-blue-400/20 to-cyan-400/20'
  },
  {
    name: 'Сон',
    icon: BsMoonStars,
    href: '/habits/sleep',
    color: 'from-indigo-400/20 to-violet-400/20'
  },
  {
    name: 'Финансы',
    icon: RiMoneyDollarCircleLine,
    href: '/habits/finance',
    color: 'from-amber-400/20 to-yellow-400/20'
  },
  {
    name: 'Задачи',
    icon: MdOutlineTaskAlt,
    href: '/habits/tasks',
    color: 'from-rose-400/20 to-pink-400/20'
  }
]

export default function Home() {
  const [userId, setUserId] = useState<number>(375634162) // Дефолтный ID

  useEffect(() => {
    // Получаем userId из Telegram WebApp
    if (window.Telegram?.WebApp) {
      const telegramId = window.Telegram.WebApp.initDataUnsafe.user?.id
      if (telegramId) {
        setUserId(telegramId)
        console.log('Telegram user ID:', telegramId)
      } else {
        console.log('Using default user ID:', userId)
      }
    }
  }, [])

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <UserIdContext.Provider value={userId}>
        <main className="relative min-h-screen overflow-hidden">
          {/* Animated gradient background */}
          <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-gradient-slow" />
          <div className="fixed inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5 animate-gradient-slow-reverse" />
          
          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-8">
            {/* Top panel */}
            <div className="flex justify-end mb-12">
              <Link
                href="/contacts"
                className="flex items-center gap-2 px-6 py-3 text-lg rounded-xl 
                  bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 
                  transition-all duration-300 hover:scale-105"
              >
                <MdOutlineContactPage className="w-6 h-6" />
                <span>Контакты</span>
              </Link>
            </div>

            {/* Habits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => {
                const Icon = habit.icon
                return (
                  <Link
                    key={habit.name}
                    href={habit.href}
                    className="group relative h-[180px] p-6 rounded-2xl 
                      bg-white/5 backdrop-blur-lg border border-white/10
                      hover:bg-white/10 transition-all duration-300 
                      hover:scale-105 hover:shadow-xl hover:shadow-white/5"
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${habit.color} 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Content */}
                    <div className="relative flex flex-col h-full">
                      <Icon className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <h2 className="text-xl font-medium mb-2">{habit.name}</h2>
                      {habit.progress && (
                        <div className="mt-auto">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-white/30 rounded-full" />
                          </div>
                          <p className="text-sm text-white/60 mt-2">{habit.progress}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </UserIdContext.Provider>
    </>
  )
}
