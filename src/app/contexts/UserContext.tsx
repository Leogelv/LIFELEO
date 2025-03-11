'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { logger } from '@/utils/logger'

// Контекст для ID пользователя
export const UserIdContext = createContext<number>(375634162)

// Провайдер контекста с динамической проверкой URL-параметров
export function UserIdProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number>(375634162) // Дефолтное значение
  
  useEffect(() => {
    // Функция для проверки URL-параметров
    const getUserIdFromUrl = () => {
      try {
        if (typeof window === 'undefined') return null
        
        // Проверяем разные варианты параметров
        const urlParams = new URLSearchParams(window.location.search)
        let userIdParam = urlParams.get('user_id') || urlParams.get('userid') || urlParams.get('userId')
        
        // Проверка на случай, если весь query string - это просто userId
        if (!userIdParam && window.location.href.includes('?')) {
          const rawQuery = window.location.href.split('?')[1]
          if (rawQuery && !rawQuery.includes('=')) {
            userIdParam = rawQuery
          }
        }
        
        if (userIdParam) {
          const parsedId = parseInt(userIdParam, 10)
          if (!isNaN(parsedId)) {
            logger.info('Найден userId в URL-параметрах:', parsedId)
            return parsedId
          }
        }
        
        return null
      } catch (error) {
        logger.error('Ошибка при получении userId из URL:', error)
        return null
      }
    }

    // Проверяем параметры URL
    const urlUserId = getUserIdFromUrl()
    if (urlUserId) {
      setUserId(urlUserId)
    }
  }, [])
  
  return (
    <UserIdContext.Provider value={userId}>
      {children}
    </UserIdContext.Provider>
  )
} 