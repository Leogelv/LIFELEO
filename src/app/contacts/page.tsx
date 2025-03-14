'use client'

import { ContactList } from '../components/ContactList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useUserId } from '../contexts/UserIdContext'
import { useTelegram } from '../hooks/useTelegram'
import { useEffect, useState } from 'react'

export default function ContactsPage() {
  const contextUserId = useUserId()
  const { userId: telegramUserId, isInitialized } = useTelegram()
  const [effectiveUserId, setEffectiveUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Определяем эффективный userId из всех возможных источников
  useEffect(() => {
    console.log('🔄 ContactsPage: Определение effectiveUserId', {
      contextUserId,
      telegramUserId,
      isInitialized
    })

    // Используем userId из контекста, если он есть
    if (contextUserId) {
      console.log('✅ ContactsPage: Используем userId из контекста:', contextUserId)
      setEffectiveUserId(contextUserId)
    } 
    // Иначе используем userId из Telegram, если он есть
    else if (telegramUserId) {
      console.log('✅ ContactsPage: Используем userId из Telegram:', telegramUserId)
      setEffectiveUserId(telegramUserId)
    }
    
    setIsLoading(false)
  }, [contextUserId, telegramUserId, isInitialized])

  // Если приложение не инициализировано или нет userId, показываем загрузку
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1A1A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8D9C5]"></div>
      </div>
    )
  }

  // Если нет userId, показываем сообщение об ошибке
  if (!effectiveUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1A1A1A] text-[#E8D9C5] p-6 text-center">
        <Icon icon="solar:user-broken" className="w-16 h-16 mb-4 text-[#E8D9C5]/50" />
        <h1 className="text-2xl font-bold mb-2">Не удалось определить пользователя</h1>
        <p className="mb-6">Для доступа к контактам необходимо авторизоваться</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    )
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2A2A]/50 hover:bg-[#2A2A2A] transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-2xl font-bold">Контакты</h1>
            <div className="w-[76px]"></div>
          </div>
        </div>
        <ContactList userId={effectiveUserId} />
      </SafeArea>
      <BottomMenu />
    </>
  )
} 