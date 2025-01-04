'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface MeditationSession {
  uuid: string
  user_id: string
  date: string
  type: string
  duration: number
  completed: boolean
  time_left?: number
}

interface MeditationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MeditationModal({ isOpen, onClose }: MeditationModalProps) {
  const [timeLeftMinutes, setTimeLeftMinutes] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [userId, setUserId] = useState<string>('375634162') // Дефолтный userId
  const [session, setSession] = useState<MeditationSession | null>(null)
  const supabase = createClient()
  const gongAudioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Проверяем наличие Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      // Здесь можно получить userId из Telegram WebApp
      // setUserId(tg.initDataUnsafe?.user?.id)
    }
  }, [])

  // Инициализируем аудио при монтировании с preload
  useEffect(() => {
    gongAudioRef.current = new Audio('/gong.wav')
    gongAudioRef.current.preload = 'auto'
  }, [])

  // При открытии модального окна создаем новую сессию
  useEffect(() => {
    if (isOpen && !session) {
      createSession()
    }
  }, [isOpen])

  // Создаем новую сессию медитации
  const createSession = async () => {
    const newSession: MeditationSession = {
      uuid: crypto.randomUUID(),
      user_id: userId,
      date: new Date().toISOString(),
      type: 'vipassana',
      duration: 0,
      completed: false,
      time_left: 60
    }

    const { error } = await supabase
      .from('meditation_sessions')
      .insert(newSession)

    if (error) {
      console.error('Error creating session:', error)
      return
    }

    setSession(newSession)
  }

  // Функция завершения медитации
  const finishMeditation = async () => {
    setIsActive(false)
    
    // Играем гонг
    if (gongAudioRef.current) {
      try {
        await gongAudioRef.current.play()
      } catch (error) {
        console.error('Error playing gong:', error)
      }
    }

    // Обновляем сессию как завершенную
    if (session?.uuid) {
      const { error } = await supabase
        .from('meditation_sessions')
        .update({
          duration: 60,
          completed: true,
          time_left: 0
        })
        .eq('uuid', session.uuid)

      if (error) {
        console.error('Error completing session:', error)
      }
    }

    setTimeout(() => {
      router.push('/')
    }, 2000) // Даем время на проигрывание гонга
  }

  // Основной таймер
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeftMinutes >= 0) {
      interval = setInterval(async () => {
        setTimeLeftMinutes(time => {
          const newTime = time - 1/60
          
          // Если время вышло - завершаем
          if (newTime <= 0) {
            finishMeditation()
            return 0
          }
          
          return newTime
        })

        // Обновляем время в базе каждую минуту
        if (Math.floor(timeLeftMinutes) !== Math.floor(timeLeftMinutes - 1/60) && session) {
          await supabase
            .from('meditation_sessions')
            .update({
              time_left: Math.floor(timeLeftMinutes),
              duration: 60 - Math.floor(timeLeftMinutes)
            })
            .eq('uuid', session.uuid)
        }
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, timeLeftMinutes, session])

  const handleStart = () => {
    setIsActive(true)
  }

  const handleCancel = async () => {
    setIsActive(false)
    
    // Удаляем незавершенную сессию
    if (session?.uuid) {
      await supabase
        .from('meditation_sessions')
        .delete()
        .eq('uuid', session.uuid)
    }
    
    router.push('/')
  }

  const handleAddTime = async () => {
    try {
      const additionalMinutes = 30
      const newTimeLeft = timeLeftMinutes + additionalMinutes
      setTimeLeftMinutes(newTimeLeft)
      
      if (!session?.uuid) {
        console.error('No session UUID available')
        return
      }

      const { error: updateError } = await supabase
        .from('meditation_sessions')
        .update({ time_left: Math.floor(newTimeLeft) })
        .eq('uuid', session.uuid)

      if (updateError) {
        console.error('Error updating session:', updateError)
      }
    } catch (error) {
      console.error('Failed to add time:', error)
    }
  }

  const handleClose = () => {
    onClose()
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] 
              rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/90
              border border-white/10 shadow-2xl"
          >
            {/* Солнце */}
            <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full 
                  bg-gradient-to-r from-amber-500 to-orange-500 blur-2xl opacity-50"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-amber-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42"/>
                </svg>
              </motion.div>
            </div>

            {/* Таймер */}
            <div className="mt-32 sm:mt-36 md:mt-40 mb-8 sm:mb-10 md:mb-12 text-center">
              <motion.div
                animate={{
                  scale: isActive ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8"
              >
                {/* Минуты */}
                <div className="w-[120px] sm:w-[180px] md:w-[240px] text-right">
                  <span className="text-[100px] sm:text-[150px] md:text-[200px] font-sans font-thin tracking-tight text-white/90"
                    style={{
                      textShadow: '0 0 60px rgba(255,255,255,0.15)'
                    }}>
                    {Math.floor(timeLeftMinutes).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Двоеточие */}
                <div className="text-[100px] sm:text-[150px] md:text-[200px] font-sans font-thin tracking-tight text-white/90 -mt-4 sm:-mt-6 md:-mt-8">:</div>

                {/* Секунды */}
                <div className="w-[120px] sm:w-[180px] md:w-[240px] text-left">
                  <span className="text-[100px] sm:text-[150px] md:text-[200px] font-sans font-thin tracking-tight text-white/90"
                    style={{
                      textShadow: '0 0 60px rgba(255,255,255,0.15)'
                    }}>
                    {Math.floor((timeLeftMinutes % 1) * 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                className="mt-4 sm:mt-6 md:mt-8 text-xl sm:text-2xl font-sans font-thin tracking-wide text-white/40"
              >
                адиттхана
              </motion.p>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 p-4 sm:p-6 md:pb-12">
              {!isActive ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-xl border border-purple-500/30 
                    text-white text-base sm:text-lg font-sans font-thin tracking-wide 
                    transition-all duration-300 relative group overflow-hidden
                    hover:border-purple-500/50"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 bg-gradient-to-r 
                    from-purple-500/10 to-pink-500/10" />
                  <span className="relative z-10 bg-gradient-to-r from-purple-500 to-pink-500 
                    bg-clip-text text-transparent">Начать</span>
                </motion.button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddTime}
                    className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl border border-emerald-500/30
                      text-white text-base sm:text-lg font-sans font-thin tracking-wide 
                      transition-all duration-300 relative group overflow-hidden
                      hover:border-emerald-500/50"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 bg-gradient-to-r 
                      from-emerald-500/10 to-teal-500/10" />
                    <span className="relative z-10 bg-gradient-to-r from-emerald-500 to-teal-500 
                      bg-clip-text text-transparent">+30 мин</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-xl border border-red-500/30
                      text-white text-base sm:text-lg font-sans font-thin tracking-wide 
                      transition-all duration-300 relative group overflow-hidden
                      hover:border-red-500/50"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 bg-gradient-to-r 
                      from-red-500/10 to-pink-500/10" />
                    <span className="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 
                      bg-clip-text text-transparent">Отменить</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Закрыть */}
            <button
              onClick={handleClose}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 text-white/50 hover:text-white/80 transition-colors"
            >
              <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 