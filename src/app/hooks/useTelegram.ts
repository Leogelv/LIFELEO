'use client'

import { useEffect, useState } from 'react'
import type { TelegramUser } from '../types/telegram-webapp'

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [userData, setUserData] = useState<TelegramUser | null>(null)

  // Проверяем, есть ли объект window.Telegram?.WebApp
  const isTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp

  // Если мы в тестовой среде, используем тестовый ID
  const userId = isTelegram && window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 375634162

  useEffect(() => {
    if (!isTelegram) {
      setIsReady(true)
      return
    }

    const tg = window.Telegram!.WebApp

    // Инициализация только если мы в Telegram
    const onReady = () => {
      setIsReady(true)
      setUserData(tg.initDataUnsafe?.user || null)
    }

    const onExpand = () => {
      setIsExpanded(true)
    }

    tg.ready()
    tg.expand()
    
    // Устанавливаем цвет хедера и отключаем свайпы только в телеграме
    tg.setHeaderColor('#1A1A1A')
    tg.isVerticalSwipesEnabled = true
    tg.disableVerticalSwipes()

    onReady()
    onExpand()

    return () => {
      // Очистка, если нужна
    }
  }, [isTelegram])

  return {
    isReady,
    isExpanded,
    userId,
    userData,
    isTelegram
  }
} 