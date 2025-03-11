'use client'

import { useState, useEffect } from 'react'

const ENV_PASSWORD = process.env.NEXT_PUBLIC_SIXDIGIT_PASSWORD || '323800'

export function SimplePasswordModal() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Проверяем, был ли уже введен пароль только на клиенте
  useEffect(() => {
    setIsMounted(true)
    const savedAuth = localStorage.getItem('isAuthorized') === 'true'
    setIsAuthorized(savedAuth)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ENV_PASSWORD) {
      // Сохраняем в localStorage, что пароль был введен
      localStorage.setItem('isAuthorized', 'true')
      setIsAuthorized(true)
    } else {
      setError('Неверный пароль')
      setPassword('')
    }
  }

  // Если не на клиенте, ничего не показываем
  if (!isMounted) {
    return null
  }

  // Если уже авторизован, не показываем модальное окно
  if (isAuthorized) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-[#1A1A1A] rounded-2xl p-10 w-full max-w-lg border border-[#444] shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#E8D9C5] mb-6">LIFELEO</h1>
          <p className="text-[#E8D9C5]/80 text-xl mb-2">Введите пароль для доступа</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Введите пароль"
              className="w-full bg-[#2A2A2A] border border-[#444] rounded-xl px-6 py-5 text-[#E8D9C5] text-2xl focus:outline-none focus:ring-2 focus:ring-[#E8D9C5]/50 text-center"
              autoFocus
            />
            
            {error && (
              <p className="text-red-400 text-lg mt-4 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#E8D9C5]/30 to-[#E8D9C5]/40 hover:from-[#E8D9C5]/40 hover:to-[#E8D9C5]/50 text-[#E8D9C5] font-medium py-5 px-6 rounded-xl transition-all text-xl"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  )
} 