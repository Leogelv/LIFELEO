'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import Script from 'next/script'
import { createContext, useEffect, useState } from 'react'

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
export const UserIdContext = createContext<number>(375634162) // Дефолтный ID

function NavigationCard({ href, icon, title, gradientFrom, gradientTo, onClick }: {
  href: string
  icon: string
  title: string
  gradientFrom: string
  gradientTo: string
  onClick: () => void
}) {
  return (
    <Link 
      href={href} 
      onClick={(e) => {
        // Мгновенный фидбек
        const target = e.currentTarget;
        target.style.transform = 'scale(0.95)';
        target.style.opacity = '0.7';
        onClick();
      }}
      className="group relative overflow-hidden rounded-3xl aspect-[4/3] p-8 border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02] backdrop-blur-sm hover:border-[#E8D9C5]/20 transition-all duration-500"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradientFrom} ${gradientTo} blur-xl`} />
      <div className="relative z-10">
        <Icon icon={icon} className="w-12 h-12 text-[#E8D9C5] mb-4" />
        <h2 className="text-2xl text-[#E8D9C5]">{title}</h2>
      </div>
    </Link>
  )
}

export default function Home() {
  const [userId, setUserId] = useState<number>(375634162)
  const [isNavigating, setIsNavigating] = useState(false)

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

    // Очищаем состояние навигации при монтировании
    setIsNavigating(false)
    document.body.classList.remove('navigating')
  }, [])

  const handleNavigation = () => {
    setIsNavigating(true)
    // Добавляем класс для блюра всего контента
    document.body.classList.add('navigating')
  }

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <UserIdContext.Provider value={userId}>
        <main className={`min-h-screen p-6 font-light relative overflow-hidden transition-all duration-300 ${isNavigating ? 'scale-95 blur-sm' : ''}`} 
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
        >
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
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-4xl text-[#E8D9C5]">Панель Смыслов</h1>
              <Link 
                href="/contacts" 
                onClick={handleNavigation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8D9C5]/10 bg-[#E8D9C5]/5 backdrop-blur-sm hover:border-[#E8D9C5]/20 transition-all duration-500"
              >
                <Icon icon="solar:users-group-rounded-outline" className="w-5 h-5 text-[#E8D9C5]" />
                <span className="text-[#E8D9C5]">Контакты</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NavigationCard
                href="/habits/tasks"
                icon="solar:clipboard-list-outline"
                title="Задачи"
                gradientFrom="from-orange-500/30"
                gradientTo="to-rose-500/30"
                onClick={handleNavigation}
              />
              <NavigationCard
                href="/habits/meditation"
                icon="solar:meditation-broken"
                title="Медитация"
                gradientFrom="from-purple-500/30"
                gradientTo="to-blue-500/30"
                onClick={handleNavigation}
              />
              <NavigationCard
                href="/habits/sport"
                icon="solar:dumbbell-small-outline"
                title="Спорт"
                gradientFrom="from-green-500/30"
                gradientTo="to-emerald-500/30"
                onClick={handleNavigation}
              />
              <NavigationCard
                href="/habits/water"
                icon="solar:glass-water-bold"
                title="Вода"
                gradientFrom="from-blue-500/30"
                gradientTo="to-cyan-500/30"
                onClick={handleNavigation}
              />
              <NavigationCard
                href="/habits/sleep"
                icon="solar:moon-sleep-outline"
                title="Сон"
                gradientFrom="from-indigo-500/30"
                gradientTo="to-violet-500/30"
                onClick={handleNavigation}
              />
              <NavigationCard
                href="/habits/finance"
                icon="solar:wallet-outline"
                title="Финансы"
                gradientFrom="from-yellow-500/30"
                gradientTo="to-amber-500/30"
                onClick={handleNavigation}
              />
            </div>
          </div>
        </main>
      </UserIdContext.Provider>

      <style jsx global>{`
        body.navigating * {
          pointer-events: none;
        }
      `}</style>
    </>
  )
}
