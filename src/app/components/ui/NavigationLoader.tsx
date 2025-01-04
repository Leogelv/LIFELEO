'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NavigationLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // При изменении пути показываем лоадер
    setIsLoading(true)
    
    // Скрываем через небольшую задержку
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center"
    >
      <div className="relative">
        {/* Внешний круг */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="w-16 h-16 rounded-full border-2 border-[#E8D9C5]/20"
        />
        
        {/* Внутренний круг */}
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, delay: 0.5 }
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#E8D9C5]/40" />
        </motion.div>
      </div>
    </motion.div>
  )
} 