'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        isExpanded: boolean
        expand: () => void
        MainButton: {
          show: () => void
          hide: () => void
        }
      }
    }
  }
}

export function TelegramLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [userId, setUserId] = useState<string>('375634162') // Дефолтный userId

  useEffect(() => {
    // Проверяем наличие Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Проверяем, развернуто ли приложение
      setIsExpanded(tg.isExpanded)
      
      // Если не развернуто - разворачиваем
      if (!tg.isExpanded) {
        tg.expand()
      }
    }
  }, [])

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isExpanded ? 'pt-[100px]' : ''}`}>
      {children}
    </div>
  )
} 