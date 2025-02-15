'use client'

import { useEffect, useState } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  requestFullscreen: () => void
  isVerticalSwipesEnabled: boolean
  disableVerticalSwipes: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  initDataUnsafe: {
    user?: TelegramUser
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [userId, setUserId] = useState<number>()
  const [userData, setUserData] = useState<TelegramUser | null>(null)

  const isTelegram = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  const tg = isTelegram

  useEffect(() => {
    if (isTelegram) {
      setIsReady(true)
      setIsExpanded(true)
      const user = isTelegram.initDataUnsafe?.user
      if (user) {
        setUserId(user.id)
        setUserData(user)
      }
    }
  }, [isTelegram])

  return {
    isReady,
    isExpanded,
    userId,
    userData,
    isTelegram,
    tg
  }
} 