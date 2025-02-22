'use client'

import { useTelegram } from '../hooks/useTelegram'

interface SafeAreaProps {
  children: React.ReactNode
  className?: string
}

export function SafeArea({ children, className = '' }: SafeAreaProps) {
  const { safeAreaInset } = useTelegram()

  return (
    <div 
      style={{ 
        paddingTop: `${safeAreaInset.top}px`,
        paddingRight: `${safeAreaInset.right}px`,
        paddingBottom: `${safeAreaInset.bottom}px`,
        paddingLeft: `${safeAreaInset.left}px`
      }}
      className={className}
    >
      {children}
    </div>
  )
} 