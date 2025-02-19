'use client'

import { useEffect, useState } from 'react'
import type { TelegramWebApp } from '../types/telegram-webapp'

export function useTelegram() {
  const [userPhoto, setUserPhoto] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [userId, setUserId] = useState<number>(0)

  useEffect(() => {
    // Ждем загрузки скрипта
    const initTelegram = () => {
      const telegram = window.Telegram
      const webApp = telegram?.WebApp

      if (webApp) {
        // Инициализация WebApp
        webApp.ready()
        webApp.expand()
        webApp.requestFullscreen()
        webApp.isVerticalSwipesEnabled = false
        webApp.disableVerticalSwipes()
        webApp.setHeaderColor('#1a1a1a')
        webApp.setBackgroundColor('#1a1a1a')
        setIsExpanded(true)

        // Получаем данные пользователя
        if (webApp.initDataUnsafe?.user) {
          const user = webApp.initDataUnsafe.user
          setUserPhoto(user.photo_url || '')
          setUserName(user.first_name || user.username || 'Пользователь')
          setUserId(user.id || 375634162)
        }
      }
    }

    // Пробуем инициализировать сразу
    initTelegram()

    // И также подписываемся на событие загрузки скрипта
    const script = document.querySelector('script[src*="telegram-web-app.js"]')
    if (script) {
      script.addEventListener('load', initTelegram)
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initTelegram)
      }
    }
  }, [])

  return {
    userPhoto,
    userName,
    userId,
    isExpanded
  }
} 