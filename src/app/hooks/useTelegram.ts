'use client'

import { useState, useEffect } from 'react'

const DEFAULT_USER_ID = 375634162

export function useTelegram() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [userId, setUserId] = useState(DEFAULT_USER_ID)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Проверяем, есть ли Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Инициализация WebApp
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
      }

      // Слушаем изменения режима отображения
      setIsExpanded(tg.isExpanded)
      tg.onEvent('viewportChanged', () => {
        setIsExpanded(tg.isExpanded)
      })
    }
  }, [])

  return {
    isExpanded,
    userId,
    userData,
    isTelegram: typeof window !== 'undefined' && !!window.Telegram?.WebApp
  }
} 