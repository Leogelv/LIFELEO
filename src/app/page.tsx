'use client'

import { UserIdProvider } from './contexts/UserContext'
import { HabitCard } from './components/habits/HabitCard'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import TelegramScript from './components/TelegramScript'
import { useTelegram } from './hooks/useTelegram'
import { BottomMenu } from './components/BottomMenu'

export default function Home() {
  const { isExpanded, userId, userData, isTelegram } = useTelegram()

  return (
    <UserIdProvider value={userId}>
      <TelegramScript />
      <main className={`min-h-screen relative overflow-hidden pb-20 ${isExpanded ? 'pt-[100px]' : ''}`}>
        {/* Оптимизированные CSS блобы */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <style jsx>{`
            .blob {
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              mix-blend-mode: screen;
              filter: blur(80px);
              animation: float 20s infinite ease-in-out;
              opacity: 0.7;
            }
            
            .blob-1 {
              background: linear-gradient(90deg, rgba(255,107,0,0.2) 0%, rgba(255,0,81,0.2) 100%);
              top: -50%;
              left: -50%;
              animation-delay: 0s;
            }
            
            .blob-2 {
              background: linear-gradient(90deg, rgba(128,0,255,0.2) 0%, rgba(0,102,255,0.2) 100%);
              bottom: -50%;
              right: -50%;
              animation-delay: -7s;
            }
            
            .blob-3 {
              background: linear-gradient(90deg, rgba(0,255,255,0.2) 0%, rgba(0,102,255,0.2) 100%);
              top: -50%;
              right: -50%;
              animation-delay: -14s;
            }
            
            @keyframes float {
              0%, 100% {
                transform: translate(0, 0) scale(1);
              }
              25% {
                transform: translate(10%, 10%) scale(1.1);
              }
              50% {
                transform: translate(-5%, 5%) scale(0.9);
              }
              75% {
                transform: translate(5%, -10%) scale(1.05);
              }
            }
          `}</style>
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

          {/* Кнопка "На домашний экран" только для Telegram */}
          {isTelegram && (
            <button
              onClick={() => window.Telegram?.WebApp.addToHomeScreen?.()}
              className="mx-auto mt-12 block px-4 py-2 text-sm text-[#E8D9C5]/70 border border-[#E8D9C5]/10 rounded-xl hover:border-[#E8D9C5]/20 transition-all duration-500"
            >
              На домашний экран
            </button>
          )}
        </div>
      </main>
      <BottomMenu />
    </UserIdProvider>
  )
}
