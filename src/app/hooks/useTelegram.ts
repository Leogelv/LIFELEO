'use client'

import { useEffect, useState } from 'react'
import type { TelegramUser } from '../types/telegram-webapp'

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [userData, setUserData] = useState<TelegramUser | null>(null)

  // Проверяем, запущены ли мы в локалхосте
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  )

  // Проверяем, есть ли объект window.Telegram?.WebApp и не локалхост ли это
  const isTelegram = !isLocalhost && typeof window !== 'undefined' && window.Telegram?.WebApp

  // Если мы в тестовой среде или локалхосте, используем тестовый ID
  const userId = isTelegram ? window.Telegram?.WebApp?.initDataUnsafe?.user?.id : 375634162

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

    try {
      tg.ready()
      tg.expand()
      
      // Безопасный вызов requestFullscreen только если метод существует
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen()
      }
      
      // Устанавливаем цвет хедера и отключаем свайпы только в телеграме
      tg.setHeaderColor('#1A1A1A')
      tg.isVerticalSwipesEnabled = true
      tg.disableVerticalSwipes()

      onReady()
      onExpand()
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error)
      setIsReady(true)
    }

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