'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SafeArea } from './components/SafeArea'
import { BottomMenu } from './components/BottomMenu'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Базовый рендер для сервера
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-[#E8D9C5] p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl mb-6">Страница не найдена</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-[#E8D9C5] p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl mb-6">Страница не найдена</h2>
          <p className="mb-8 text-[#E8D9C5]/70">
            Извините, запрашиваемая страница не существует.
          </p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 rounded-lg transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
} 