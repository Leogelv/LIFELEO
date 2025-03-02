'use client'

import { useEffect, useState } from 'react'
import { SafeArea } from '@/app/components/SafeArea'
import { BottomMenu } from '@/app/components/BottomMenu'
import { useTelegram } from '@/app/hooks/useTelegram'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VoiceBot() {
  const { safeAreaInset, isTelegramWebApp } = useTelegram()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Имитация загрузки
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-8">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center mr-4"
                >
                  <Icon icon="solar:arrow-left-bold" className="w-5 h-5 text-[#E8D9C5]" />
                </motion.div>
              </Link>
              <h1 className="text-2xl font-bold">Голосовой бот</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Icon icon="solar:microphone-bold" className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Описание */}
          <div className="bg-[#2A2A2A] rounded-xl p-6 border border-[#E8D9C5]/10 mb-6">
            <p className="text-[#E8D9C5]/80 mb-4">
              Голосовой бот позволяет общаться с ИИ-ассистентом с помощью голоса. 
              Вы можете задавать вопросы, получать информацию и управлять своими задачами и привычками.
            </p>
            <div className="flex items-center text-emerald-400">
              <Icon icon="solar:info-circle-bold" className="w-5 h-5 mr-2" />
              <p className="text-sm">Для работы требуется доступ к микрофону</p>
            </div>
          </div>

          {/* Веб-представление */}
          <div 
            className="w-full rounded-xl overflow-hidden bg-[#2A2A2A] border border-[#E8D9C5]/10"
            style={{ 
              height: 'calc(100vh - 250px)',
              minHeight: '400px',
              marginTop: isTelegramWebApp ? `${safeAreaInset.top}px` : '0'
            }}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-[#E8D9C5]/60">Загрузка голосового бота...</p>
                </div>
              </div>
            ) : (
              <iframe 
                src="https://kpcaller2.vercel.app" 
                className="w-full h-full border-0"
                style={{ 
                  paddingTop: isTelegramWebApp ? `${safeAreaInset.top}px` : '0'
                }}
              />
            )}
          </div>

          {/* Подсказки */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Примеры команд</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#E8D9C5]/10">
                <p className="text-emerald-400 font-medium mb-1">"Создай задачу на завтра"</p>
                <p className="text-[#E8D9C5]/60 text-sm">Бот поможет создать новую задачу</p>
              </div>
              <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#E8D9C5]/10">
                <p className="text-emerald-400 font-medium mb-1">"Какие у меня задачи на сегодня?"</p>
                <p className="text-[#E8D9C5]/60 text-sm">Бот расскажет о запланированных задачах</p>
              </div>
              <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#E8D9C5]/10">
                <p className="text-emerald-400 font-medium mb-1">"Отметь привычку 'Медитация' как выполненную"</p>
                <p className="text-[#E8D9C5]/60 text-sm">Бот отметит выполнение привычки</p>
              </div>
            </div>
          </div>
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
} 