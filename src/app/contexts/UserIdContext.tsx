'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getUserIdFromUrl, getUsernameFromUrl } from '../hooks/useTelegram'

// Создаем интерфейс для контекста
interface UserContextType {
  userId: number;
  username: string;
}

// Создаем контекст с типом и значением по умолчанию
const UserIdContext = createContext<UserContextType>({
  userId: 0,
  username: 'Пользователь'
})

// Экспортируем хук для использования контекста
export const useUserId = () => useContext(UserIdContext).userId
export const useUsername = () => useContext(UserIdContext).username
export const useUserContext = () => useContext(UserIdContext)

// Создаем Provider компонент
export function UserIdProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number>(0)
  const [username, setUsername] = useState<string>('Пользователь')
  const [isClient, setIsClient] = useState(false)

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true)

    // Функция для получения userId из URL
    const getUserData = () => {
      const extractedUserId = getUserIdFromUrl()
      const extractedUsername = getUsernameFromUrl()
      
      console.log('🔍 UserIdContext: извлечен userId из URL:', extractedUserId)
      console.log('🔍 UserIdContext: извлечено имя из URL:', extractedUsername)
      
      setUserId(extractedUserId)
      setUsername(extractedUsername)
    }

    // Вызываем при монтировании компонента
    getUserData()

    // Подписываемся на изменения URL
    if (typeof window !== 'undefined') {
      // При изменении URL (например, после навигации)
      const handleRouteChange = () => {
        getUserData()
      }

      // Подписываемся на событие popstate (когда пользователь нажимает назад/вперед)
      window.addEventListener('popstate', handleRouteChange)

      // Создаем наблюдатель за URL параметрами
      let lastUrl = window.location.href
      const urlObserver = setInterval(() => {
        if (lastUrl !== window.location.href) {
          lastUrl = window.location.href
          getUserData()
        }
      }, 1000) // Проверяем каждую секунду
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        clearInterval(urlObserver)
      }
    }
  }, [isClient])

  const contextValue: UserContextType = {
    userId,
    username
  }

  return (
    <UserIdContext.Provider value={contextValue}>
      {children}
    </UserIdContext.Provider>
  )
} 