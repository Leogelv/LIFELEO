'use client'

import { useTelegram } from '../hooks/useTelegram'
import { useEffect, useState } from 'react'

interface SafeAreaProps {
  children: React.ReactNode
  className?: string
}

export function SafeArea({ children, className = '' }: SafeAreaProps) {
  const { safeAreaInset, isTelegramWebApp, isClient } = useTelegram()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Базовый отступ сверху для хедера
  const headerPadding = 85

  // Если компонент не смонтирован или не на клиенте, рендерим без отступов
  if (!mounted || !isClient) {
    return (
      <div 
        style={{ paddingTop: `${headerPadding}px` }}
        className={className}
      >
        {children}
      </div>
    )
  }

  return (
    <div 
      style={{ 
        paddingTop: `${headerPadding}px`,
        paddingRight: isTelegramWebApp ? `${safeAreaInset.right}px` : '0px',
        paddingBottom: isTelegramWebApp ? `${safeAreaInset.bottom}px` : '0px',
        paddingLeft: isTelegramWebApp ? `${safeAreaInset.left}px` : '0px'
      }}
      className={className}
    >
      {children}
    </div>
  )
} 