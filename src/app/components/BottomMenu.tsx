'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTelegram } from '../hooks/useTelegram'

export const BottomMenu = () => {
  const pathname = usePathname()
  const { isTelegramWebApp } = useTelegram()

  // Если мы в Telegram WebApp, используем нативное меню Telegram
  if (isTelegramWebApp) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/80 backdrop-blur-lg border-t border-[#E8D9C5]/10 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          <Link 
            href="/" 
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === '/' 
                ? 'text-[#E8D9C5]' 
                : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            <Icon icon="solar:home-bold" className="w-6 h-6" />
            <span className="text-xs">Главная</span>
          </Link>
          
          <Link 
            href="/tasks" 
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === '/tasks' 
                ? 'text-[#E8D9C5]' 
                : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            <Icon icon="solar:checklist-minimalistic-bold" className="w-6 h-6" />
            <span className="text-xs">Задачи</span>
          </Link>
          
          <Link 
            href="/habits" 
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === '/habits' 
                ? 'text-[#E8D9C5]' 
                : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            <Icon icon="solar:star-bold" className="w-6 h-6" />
            <span className="text-xs">Привычки</span>
          </Link>
          
          <Link 
            href="/contacts" 
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === '/contacts' 
                ? 'text-[#E8D9C5]' 
                : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6" />
            <span className="text-xs">Контакты</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 