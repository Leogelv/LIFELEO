'use client'

import { useState, useEffect } from 'react'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import Link from 'next/link'

export default function LoginPage() {
  const [userId, setUserId] = useState('375634162')
  const [name, setName] = useState('Гость')
  const [loginUrl, setLoginUrl] = useState('')
  const [copied, setCopied] = useState(false)

  // Генерируем URL для входа
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin
      const url = `${baseUrl}/?user_id=${userId}&name=${encodeURIComponent(name)}`
      setLoginUrl(url)
    }
  }, [userId, name])

  // Копируем URL в буфер обмена
  const copyToClipboard = () => {
    navigator.clipboard.writeText(loginUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(err => {
        console.error('Не удалось скопировать URL:', err)
      })
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] text-[#E8D9C5] p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Вход в LIFELEO</h1>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block mb-2">ID пользователя:</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-3 bg-[#2A2A2A] rounded-lg border border-[#E8D9C5]/20 focus:border-[#E8D9C5]/40 outline-none"
              />
            </div>
            
            <div>
              <label className="block mb-2">Имя пользователя:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-[#2A2A2A] rounded-lg border border-[#E8D9C5]/20 focus:border-[#E8D9C5]/40 outline-none"
              />
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] p-4 rounded-lg mb-6 break-all">
            <p className="text-sm mb-2 text-[#E8D9C5]/70">Ссылка для входа:</p>
            <p>{loginUrl}</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 rounded-lg transition-colors flex-1"
            >
              {copied ? 'Скопировано!' : 'Скопировать ссылку'}
            </button>
            
            <Link
              href={loginUrl}
              className="px-6 py-3 bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 rounded-lg transition-colors flex-1 text-center"
            >
              Войти
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-[#2A2A2A] rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Как использовать:</h2>
            <ol className="list-decimal list-inside space-y-2 text-[#E8D9C5]/80">
              <li>Введите ID пользователя (по умолчанию используется твой ID)</li>
              <li>Введите имя пользователя (опционально)</li>
              <li>Скопируйте ссылку или нажмите "Войти"</li>
              <li>Используйте эту ссылку для быстрого входа в приложение без Telegram</li>
            </ol>
          </div>
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
} 