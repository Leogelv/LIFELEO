'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/utils/logger'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram } from './hooks/useTelegram'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { realtime } from '@/utils/realtime'
import { habitsRealtime } from '@/utils/habits-realtime'
import { initTelegramApp, getUserPhotoUrl } from '@/utils/telegram'
import Image from 'next/image'

interface TaskStats {
  overdue: number
  completed: number
  total: number
}

interface HabitStats {
  completedToday: number
  totalHabits: number
  streak: number
}

interface ContactStats {
  totalContacts: number
  activeChats: number
}

const menuItems = [
  {
    href: '/tasks',
    title: 'Tasks',
    description: 'Управляйте задачами и заметками',
    icon: 'game-icons:tied-scroll',
    iconSecondary: 'game-icons:scroll-unfurled',
    gradient: 'from-[#FF6B6B] to-[#4ECDC4]',
    darkGradient: 'dark:from-[#FF6B6B]/30 dark:to-[#4ECDC4]/30',
    glowColor: 'rgba(255, 107, 107, 0.3)',
    particleColor: '#FF6B6B'
  },
  {
    href: '/habits',
    title: 'Habits',
    description: 'Отслеживайте привычки и прогресс',
    icon: 'game-icons:meditation',
    iconSecondary: 'game-icons:enlightenment',
    gradient: 'from-[#A8E6CF] to-[#FFD3B6]',
    darkGradient: 'dark:from-[#A8E6CF]/30 dark:to-[#FFD3B6]/30',
    glowColor: 'rgba(168, 230, 207, 0.3)',
    particleColor: '#A8E6CF'
  },
  {
    href: '/contacts',
    title: 'Contacts',
    description: 'Управляйте контактами и общением',
    icon: 'game-icons:discussion',
    iconSecondary: 'game-icons:conversation',
    gradient: 'from-[#DCEDC1] to-[#FFD93D]',
    darkGradient: 'dark:from-[#DCEDC1]/30 dark:to-[#FFD93D]/30',
    glowColor: 'rgba(220, 237, 193, 0.3)',
    particleColor: '#DCEDC1'
  }
]

export default function Home() {
  const { isExpanded, userId } = useTelegram()
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats>({ overdue: 0, completed: 0, total: 0 })
  const [habitStats, setHabitStats] = useState<HabitStats>({ completedToday: 0, totalHabits: 0, streak: 0 })
  const [contactStats, setContactStats] = useState<ContactStats>({ totalContacts: 0, activeChats: 0 })

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initApp = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Сначала вызываем ready
        tg.ready();
        
        // Затем расширяем окно
        tg.expand();
        
        // Получаем фотку после инициализации
        const photoUrl = tg.initDataUnsafe?.user?.photo_url;
        if (photoUrl) {
          setUserPhoto(photoUrl);
        }
      }
    };
    
    initApp();
  }, []);

  // Загрузка статистики задач
  const loadTaskStats = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: tasks, error } = await supabase
        .from('todos')
        .select('*')
        .eq('telegram_id', userId)
        .eq('is_habit', false)

      if (error) throw error

      const overdue = tasks?.filter(task => 
        !task.done && new Date(task.deadline) < new Date()
      ).length || 0

      const completed = tasks?.filter(task => task.done).length || 0
      const total = tasks?.length || 0

      setTaskStats({ overdue, completed, total })
    } catch (error) {
      logger.error('Ошибка при загрузке статистики задач:', error)
    }
  }

  // Загрузка статистики привычек
  const loadHabitStats = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Получаем все привычки
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('telegram_id', userId)
        .eq('active', true)

      if (habitsError) throw habitsError

      // Получаем логи за сегодня
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('completed_at', today.toISOString())

      if (logsError) throw logsError

      const completedToday = new Set(logs?.map(log => log.habit_id)).size
      const totalHabits = habits?.length || 0

      setHabitStats({ 
        completedToday,
        totalHabits,
        streak: 0 // TODO: Добавить расчет серии
      })
    } catch (error) {
      logger.error('Ошибка при загрузке статистики привычек:', error)
    }
  }

  // Загрузка статистики контактов
  const loadContactStats = async () => {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('telegram_id', userId)

      if (error) throw error

      const totalContacts = contacts?.length || 0
      const activeChats = contacts?.filter(contact => contact.last_message_at).length || 0

      setContactStats({ totalContacts, activeChats })
    } catch (error) {
      logger.error('Ошибка при загрузке статистики контактов:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      loadTaskStats()
      loadHabitStats()
      loadContactStats()

      // Подписываемся на изменения в задачах
      const unsubscribeTasks = realtime.subscribe(`todos-${userId}`, () => {
        loadTaskStats()
      })

      // Подписываемся на изменения в привычках
      const unsubscribeHabits = habitsRealtime.subscribe(`habits-${userId}`, () => {
        loadHabitStats()
      })

      return () => {
        unsubscribeTasks()
        unsubscribeHabits()
      }
    }
  }, [userId])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-zinc-900 text-white relative"
    >
      {/* Упрощенный фон */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Header с аватаркой */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            {userPhoto && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                <Image
                  src={userPhoto}
                  alt="User photo"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h1 className="text-xl font-light tracking-wide bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              LIFELEO
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      group p-6 rounded-2xl bg-white/5 backdrop-blur-sm
                      border border-white/10 hover:border-white/20
                      transition-all duration-300
                    `}
                  >
                    {/* Icon */}
                    <div className="mb-4 relative w-12 h-12">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-center"
                      >
                        <Icon 
                          icon={item.icon} 
                          className="w-12 h-12 text-white/80" 
                        />
                      </motion.div>
                    </div>
                    
                    <h2 className="text-2xl font-light mb-2 text-white/90">
                      {item.title}
                    </h2>
                    
                    <p className="text-sm text-white/60 mb-4">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-auto text-sm">
                      {item.href === '/tasks' && (
                        <div className="flex items-center gap-4 text-white/60">
                          <div className="flex items-center gap-1">
                            <Icon icon="ph:clock" className="w-4 h-4" />
                            <span>{taskStats.overdue}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon icon="ph:check" className="w-4 h-4" />
                            <span>{taskStats.completed}/{taskStats.total}</span>
                          </div>
                        </div>
                      )}

                      {item.href === '/habits' && (
                        <div className="flex items-center gap-4 text-white/60">
                          <div className="flex items-center gap-1">
                            <Icon icon="ph:chart" className="w-4 h-4" />
                            <span>{habitStats.completedToday}/{habitStats.totalHabits}</span>
                          </div>
                          {habitStats.streak > 0 && (
                            <div className="flex items-center gap-1">
                              <Icon icon="ph:flame" className="w-4 h-4" />
                              <span>{habitStats.streak}д</span>
                            </div>
                          )}
                        </div>
                      )}

                      {item.href === '/contacts' && (
                        <div className="flex items-center gap-4 text-white/60">
                          <div className="flex items-center gap-1">
                            <Icon icon="ph:users" className="w-4 h-4" />
                            <span>{contactStats.totalContacts}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon icon="ph:chat" className="w-4 h-4" />
                            <span>{contactStats.activeChats}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}