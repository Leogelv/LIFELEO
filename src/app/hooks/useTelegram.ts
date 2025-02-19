'use client'

import { useEffect, useState } from 'react'
import type { TelegramWebApp } from '../types/telegram-webapp'

export function useTelegram() {
  const [userPhoto, setUserPhoto] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const telegram = window.Telegram
    const webApp = telegram?.WebApp

    if (webApp) {
      // Инициализация WebApp
      webApp.ready()
      webApp.expand()
      setIsExpanded(true)
      webApp.requestFullscreen()
      webApp.isVerticalSwipesEnabled = false
      webApp.disableVerticalSwipes()
      webApp.setHeaderColor('#1a1a1a')
      webApp.setBackgroundColor('#1a1a1a')

      // Получаем данные пользователя
      if (webApp.initDataUnsafe?.user) {
        setUserPhoto(webApp.initDataUnsafe.user.photo_url || '')
        setUserName(webApp.initDataUnsafe.user.first_name || webApp.initDataUnsafe.user.username || '')
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