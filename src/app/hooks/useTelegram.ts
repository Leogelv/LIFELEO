'use client'

import { useEffect, useState } from 'react'
import type { TelegramWebApp } from '../types/telegram-webapp'

// Дефолтные значения для безопасного серверного рендеринга
const defaultSafeAreaInset = { top: 0, right: 0, bottom: 0, left: 0 }
const defaultUser = {
  id: 0,
  firstName: '',
  lastName: '',
  username: '',
  photoUrl: ''
}

// Получаем значения из .env.local
const ENV_USER_ID = process.env.NEXT_PUBLIC_USER_ID ? parseInt(process.env.NEXT_PUBLIC_USER_ID) : 375634162
const ENV_USER_NAME = process.env.NEXT_PUBLIC_USER_NAME || 'Леонид'
const ENV_PASSWORD = process.env.NEXT_PUBLIC_SIXDIGIT_PASSWORD || '323800'

// Улучшенная функция для извлечения userId из URL
export function getUserIdFromUrl(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    // Сначала проверяем URL-параметры через URLSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    
    // Проверяем все возможные варианты названия параметров
    let userIdParam = urlParams.get('user_id') || urlParams.get('userid') || urlParams.get('userId') || urlParams.get('telegram_id');
    
    // Явно логируем начальные результаты поиска
    console.log('🔎 Поиск в URL параметрах:', { 
      user_id: urlParams.get('user_id'),
      userid: urlParams.get('userid'),
      userId: urlParams.get('userId'),
      telegram_id: urlParams.get('telegram_id')
    });
    console.log('🔎 Полный URL:', window.location.href);
    
    // Проверяем случай, когда весь URL после "?" это просто userid
    if (!userIdParam && window.location.href.includes('?')) {
      const rawQuery = window.location.href.split('?')[1];
      console.log('🔎 Проверка rawQuery:', rawQuery);
      if (rawQuery && !rawQuery.includes('=')) {
        userIdParam = rawQuery;
      }
    }
    
    // Проверяем случай, когда URL содержит хеш-фрагмент с userid
    if (!userIdParam && window.location.href.includes('#')) {
      const hashFragment = window.location.href.split('#')[1];
      console.log('🔎 Проверка hashFragment:', hashFragment);
      if (hashFragment && !isNaN(parseInt(hashFragment))) {
        userIdParam = hashFragment;
      }
    }
    
    // Логируем найденный параметр перед обработкой
    console.log('🔎 Найденный userIdParam перед обработкой:', userIdParam);
    
    if (userIdParam) {
      // Очищаем от возможных нечисловых символов
      const cleanedParam = userIdParam.replace(/[^0-9]/g, '');
      console.log('🔎 Очищенный параметр:', cleanedParam);
      
      const parsedUserId = parseInt(cleanedParam, 10);
      
      if (!isNaN(parsedUserId)) {
        console.log('✅ Успешно извлечен userId из URL:', parsedUserId);
        return parsedUserId;
      }
    }
    
    // Используем дефолтный ID, если ничего не найдено
    console.log('⚠️ userId не найден в URL, проверяем весь URL напрямую:', window.location.href);
    
    // Последняя попытка - ищем любое число в URL
    const urlNumberMatch = window.location.href.match(/(\d{6,})/);
    if (urlNumberMatch) {
      const extractedNumber = parseInt(urlNumberMatch[0], 10);
      console.log('🔎 Найдено число в URL:', extractedNumber);
      return extractedNumber;
    }

    console.log('❌ Не удалось найти userId в URL, использую дефолтный ID');
    return 375634162; // Дефолтный ID для тестирования
  } catch (error) {
    console.error('❌ Ошибка при чтении userId из URL:', error);
    return 375634162;
  }
}

// Новая функция для извлечения имени пользователя из URL
export function getUsernameFromUrl(): string {
  if (typeof window === 'undefined') return ENV_USER_NAME;
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Проверяем все возможные параметры имени
    let nameParam = urlParams.get('name') || urlParams.get('username') || urlParams.get('user_name');
    
    console.log('🔎 Поиск имени в URL параметрах:', { 
      name: urlParams.get('name'),
      username: urlParams.get('username'),
      user_name: urlParams.get('user_name')
    });
    
    if (nameParam) {
      console.log('✅ Успешно извлечено имя из URL:', nameParam);
      return nameParam;
    }
    
    // Не нашли имя в URL, возвращаем из .env.local
    console.log('⚠️ Имя пользователя не найдено в URL, используем имя из .env.local:', ENV_USER_NAME);
    return ENV_USER_NAME;
  } catch (error) {
    console.error('❌ Ошибка при чтении имени из URL:', error);
    return ENV_USER_NAME;
  }
}

export function useTelegram() {
  const [userPhoto, setUserPhoto] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [userId, setUserId] = useState<number>(0)
  const [safeAreaInset, setSafeAreaInset] = useState(defaultSafeAreaInset)
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true)
    
    // Проверяем, был ли пароль уже введен
    if (typeof window !== 'undefined') {
      const verified = localStorage.getItem('passwordVerified') === 'true'
      setIsPasswordVerified(verified)
    }
  }, [])

  useEffect(() => {
    // Если не на клиенте или уже инициализировано, выходим
    if (!isClient || isInitialized) return;

    // Проверяем URL параметры для браузерной версии
    const checkUrlParams = () => {
      try {
        if (typeof window === 'undefined') return false;
        
        // Используем нашу улучшенную функцию извлечения userId
        const extractedUserId = getUserIdFromUrl();
        
        if (extractedUserId) {
          console.log('Вход по URL-параметру user_id:', extractedUserId);
          setUserId(extractedUserId);
          
          // Используем нашу новую функцию для получения имени пользователя
          const extractedUsername = getUsernameFromUrl();
          setUserName(extractedUsername);
          
          // Установка фото, с проверкой
          const urlParams = new URLSearchParams(window.location.search);
          const photoParam = urlParams.get('photo') || urlParams.get('photo_url') || '';
          setUserPhoto(photoParam);
          
          setIsInitialized(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Ошибка при чтении URL параметров:', error);
        return false;
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
      
      try {
        const telegram = window.Telegram
        const webApp = telegram?.WebApp

        if (webApp) {
          // Инициализация WebApp
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
        }
        return false
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error)
        return false
      }
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
      
      // Если и в URL нет данных, используем значения из .env.local
      if (!isUrlParamsFound) {
        console.log('Используем данные из .env.local для входа')
        setUserId(ENV_USER_ID)
        setUserName(ENV_USER_NAME)
        
        // Показываем модальное окно с паролем, если пароль еще не был введен
        if (!isPasswordVerified) {
          setShowPasswordModal(true)
        } else {
          setIsInitialized(true)
        }
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
  }, [isClient, isInitialized, isPasswordVerified])

  // Функция для обработки успешного ввода пароля
  const handlePasswordSuccess = () => {
    setIsPasswordVerified(true)
    setShowPasswordModal(false)
    setIsInitialized(true)
  }

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
    isInitialized,
    isClient,
    showPasswordModal,
    handlePasswordSuccess,
    ENV_PASSWORD
  }
} 