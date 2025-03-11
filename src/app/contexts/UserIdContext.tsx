'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getUserIdFromUrl } from '../hooks/useTelegram'

// Создаем контекст с типом number и значением по умолчанию
const UserIdContext = createContext<number>(0)

// Экспортируем хук для использования контекста
export const useUserId = () => useContext(UserIdContext)

// Создаем Provider компонент
export function UserIdProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number>(0)
  const [isClient, setIsClient] = useState(false)

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true)

    // Функция для получения userId из URL
    const getUserId = () => {
      const extractedUserId = getUserIdFromUrl()
      console.log('🔍 UserIdContext: извлечен userId из URL:', extractedUserId)
      setUserId(extractedUserId)
    }

    // Вызываем при монтировании компонента
    getUserId()

    // Подписываемся на изменения URL
    if (typeof window !== 'undefined') {
      // При изменении URL (например, после навигации)
      const handleRouteChange = () => {
        getUserId()
      }

      // Подписываемся на событие popstate (когда пользователь нажимает назад/вперед)
      window.addEventListener('popstate', handleRouteChange)

      // Создаем наблюдатель за URL параметрами
      let lastUrl = window.location.href
      const urlObserver = setInterval(() => {
        if (lastUrl !== window.location.href) {
          lastUrl = window.location.href
          getUserId()
        }
      }, 1000) // Проверяем каждую секунду
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        clearInterval(urlObserver)
      }
    }
  }, [isClient])

  return (
    <UserIdContext.Provider value={userId}>
      {children}
    </UserIdContext.Provider>
  )
} 