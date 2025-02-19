'use client'

import { useEffect, useState } from 'react'
import type { TelegramUser } from '../types/telegram-webapp'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        requestFullscreen: () => void
        isVerticalSwipesEnabled: boolean
        disableVerticalSwipes: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        initDataUnsafe?: {
          user?: {
            photo_url?: string
            username?: string
            first_name?: string
          }
        }
      }
    }
  }
}

export function useTelegram() {
  const [userPhoto, setUserPhoto] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      // Инициализация WebApp
      tg.ready()
      tg.expand()
      setIsExpanded(true)
      tg.requestFullscreen()
      tg.isVerticalSwipesEnabled = false
      tg.disableVerticalSwipes()
      tg.setHeaderColor('#1a1a1a')
      tg.setBackgroundColor('#1a1a1a')

      // Получаем данные пользователя
      if (tg.initDataUnsafe?.user) {
        setUserPhoto(tg.initDataUnsafe.user.photo_url || '')
        setUserName(tg.initDataUnsafe.user.first_name || tg.initDataUnsafe.user.username || '')
      }
    }
  }, [])

  return {
    userPhoto,
    userName,
    userId: 375634162, // Дефолтный ID для разработки
    isExpanded
  }
} 