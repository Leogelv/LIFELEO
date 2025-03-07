'use client'

import { useEffect, useState } from 'react'
import type { TelegramWebApp } from '../types/telegram-webapp'

export function useTelegram() {
  const [userPhoto, setUserPhoto] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [userId, setUserId] = useState<number>(0)
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isInitialized) return;

    // Проверяем URL параметры для браузерной версии
    const checkUrlParams = () => {
      try {
        if (typeof window === 'undefined') return false;
        
        const urlParams = new URLSearchParams(window.location.search)
        // Поддерживаем оба варианта: user_id и userid
        const userIdParam = urlParams.get('user_id') || urlParams.get('userid')
        
        if (userIdParam) {
          const parsedUserId = parseInt(userIdParam, 10)
          if (!isNaN(parsedUserId)) {
            console.log('Вход по URL-параметру user_id:', parsedUserId)
            setUserId(parsedUserId)
            setUserName(urlParams.get('name') || 'Пользователь')
            setUserPhoto(urlParams.get('photo') || '')
            setIsInitialized(true)
            return true
          }
        }
        return false
      } catch (error) {
        console.error('Ошибка при чтении URL параметров:', error)
        return false
      }
    }

    // Проверяем, запущено ли приложение в Telegram WebApp
    const isTelegramEnvironment = () => {
      if (typeof window === 'undefined') return false;
      
      return window.location.href.includes('tgWebAppData') || 
             window.location.href.includes('tgWebAppPlatform') ||
             (window.Telegram && window.Telegram.WebApp);
    }

    // Ждем загрузки скрипта
    const initTelegram = () => {
      if (typeof window === 'undefined') return false;
      
      const telegram = window.Telegram
      const webApp = telegram?.WebApp

      if (webApp) {
        // Инициализация WebApp
        try {
          webApp.ready()
          webApp.expand()
          
          // Пробуем вызвать методы, которые могут быть недоступны в старых версиях
          try {
            webApp.requestFullscreen()
          } catch (e) {
            console.warn('requestFullscreen не поддерживается в этой версии WebApp')
          }
          
          try {
            webApp.isVerticalSwipesEnabled = false
            webApp.disableVerticalSwipes()
          } catch (e) {
            console.warn('disableVerticalSwipes не поддерживается в этой версии WebApp')
          }
          
          webApp.setHeaderColor('#1a1a1a')
          webApp.setBackgroundColor('#1a1a1a')
          setIsExpanded(true)
          setIsTelegramWebApp(true)

          // Получаем SafeArea
          if (webApp.SafeAreaInset) {
            setSafeAreaInset(webApp.SafeAreaInset)
          }

          // Получаем данные пользователя
          if (webApp.initDataUnsafe?.user) {
            const user = webApp.initDataUnsafe.user
            setUserPhoto(user.photo_url || '')
            setUserName(user.first_name || user.username || 'Пользователь')
            setUserId(user.id || 0)
            setIsInitialized(true)
            return true
          }
        } catch (error) {
          console.error('Ошибка при инициализации Telegram WebApp:', error)
        }
      }
      return false
    }

    // Определяем, в каком окружении запущено приложение
    const isTelegram = isTelegramEnvironment()
    
    if (isTelegram) {
      // Если в Telegram, пробуем инициализировать WebApp
      const isTelegramInitialized = initTelegram()
      
      // Если не удалось инициализировать WebApp, пробуем получить данные из URL
      if (!isTelegramInitialized) {
        checkUrlParams()
      }
      
      // Подписываемся на событие загрузки скрипта
      const script = document.querySelector('script[src*="telegram-web-app.js"]')
      if (script) {
        script.addEventListener('load', initTelegram)
      }
    } else {
      // Если не в Telegram, пробуем получить данные из URL
      const isUrlParamsFound = checkUrlParams()
      
      // Если и в URL нет данных, используем дефолтные значения
      if (!isUrlParamsFound) {
        console.log('Используем дефолтный ID для входа')
        setUserId(375634162) // Дефолтный ID для тестирования
        setUserName('Гость')
        setIsInitialized(true)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        const script = document.querySelector('script[src*="telegram-web-app.js"]')
        if (script) {
          script.removeEventListener('load', initTelegram)
        }
      }
    }
  }, [isInitialized])

  // Создаем объект user для удобства
  const user = {
    id: userId,
    firstName: userName.split(' ')[0],
    lastName: userName.split(' ').slice(1).join(' '),
    username: userName,
    photoUrl: userPhoto
  }

  return {
    userPhoto,
    userName,
    userId,
    isExpanded,
    safeAreaInset,
    isTelegramWebApp,
    user,
    isInitialized
  }
} 