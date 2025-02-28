'use client'

import { useTelegram } from '../hooks/useTelegram'

interface SafeAreaProps {
  children: React.ReactNode
  className?: string
}

export function SafeArea({ children, className = '' }: SafeAreaProps) {
  const { safeAreaInset, isTelegramWebApp } = useTelegram()

  // Базовый отступ сверху для хедера
  const headerPadding = 85

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