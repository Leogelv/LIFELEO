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
    color: '#FF6B6B'
  },
  {
    href: '/habits',
    title: 'Habits',
    description: 'Отслеживайте привычки и прогресс',
    icon: 'game-icons:meditation',
    iconSecondary: 'game-icons:enlightenment',
    color: '#A8E6CF'
  },
  {
    href: '/contacts',
    title: 'Contacts',
    description: 'Управляйте контактами и общением',
    icon: 'game-icons:discussion',
    iconSecondary: 'game-icons:conversation',
    color: '#FFD93D'
  }
]

export default function Home() {
  const { isExpanded, userId, tg } = useTelegram()
  const [taskStats, setTaskStats] = useState<TaskStats>({ overdue: 0, completed: 0, total: 0 })
  const [habitStats, setHabitStats] = useState<HabitStats>({ completedToday: 0, totalHabits: 0, streak: 0 })
  const [contactStats, setContactStats] = useState<ContactStats>({ totalContacts: 0, activeChats: 0 })
  const [wakeLock, setWakeLock] = useState<any>(null)

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

  // Telegram WebApp settings
  useEffect(() => {
    const applySettings = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        tg.requestFullscreen()
        tg.isVerticalSwipesEnabled = false
        tg.disableVerticalSwipes()
        tg.setHeaderColor('#1a1a1a')
        tg.setBackgroundColor('#1a1a1a')

        const userPhotoUrl = tg.initDataUnsafe?.user?.photo_url
        if (userPhotoUrl) {
          logger.info('User photo URL found:', userPhotoUrl)
        }
      }
    }

    applySettings()
    const interval = setInterval(applySettings, 1000)
    setTimeout(() => clearInterval(interval), 6000)

    return () => clearInterval(interval)
  }, [])

  // Wake Lock
  useEffect(() => {
    const preventScreenLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen')
          setWakeLock(lock)
          logger.info('Wake Lock активирован')
        } catch (err) {
          logger.error('Wake Lock ошибка:', err)
        }
      }
    }

    preventScreenLock()

    return () => {
      if (wakeLock) {
        wakeLock.release()
          .then(() => {
            setWakeLock(null)
            logger.info('Wake Lock деактивирован')
          })
      }
    }
  }, [])

  // Stats loading
  useEffect(() => {
    if (userId) {
      loadTaskStats()
      loadHabitStats()
      loadContactStats()

      const unsubscribeTasks = realtime.subscribe(`todos-${userId}`, () => {
        loadTaskStats()
      })

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
      className={`min-h-screen bg-[#1a1a1a] text-white relative ${
        isExpanded ? 'pt-[100px]' : ''
      }`}
    >
      {/* Simplified Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#1a1a1a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {menuItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        delay: index * 0.1,
                        duration: 0.3
                      }
                    }}
                    whileHover={{ 
                      x: 10,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden"
                  >
                    <div className={`
                      p-6 rounded-2xl bg-white/5 backdrop-blur-sm
                      border border-white/10 hover:border-white/20
                      transition-all duration-300
                    `}>
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <motion.div 
                          className="shrink-0"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon 
                            icon={item.icon} 
                            className="w-12 h-12"
                            style={{ color: item.color }} 
                          />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-light mb-2">{item.title}</h2>
                          <p className="text-white/60 text-sm mb-4">{item.description}</p>

                          {/* Stats */}
                          {item.href === '/tasks' && (
                            <div className="flex items-center gap-4 text-sm text-white/40">
                              <div className="flex items-center gap-1">
                                <Icon icon="ph:clock-countdown" className="w-4 h-4" />
                                <span>{taskStats.overdue}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon icon="ph:check" className="w-4 h-4" />
                                <span>{taskStats.completed}/{taskStats.total}</span>
                              </div>
                            </div>
                          )}

                          {item.href === '/habits' && (
                            <div className="flex items-center gap-4 text-sm text-white/40">
                              <div className="flex items-center gap-1">
                                <Icon icon="ph:chart-line-up" className="w-4 h-4" />
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
                            <div className="flex items-center gap-4 text-sm text-white/40">
                              <div className="flex items-center gap-1">
                                <Icon icon="ph:users-three" className="w-4 h-4" />
                                <span>{contactStats.totalContacts}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon icon="ph:chat-circle-dots" className="w-4 h-4" />
                                <span>{contactStats.activeChats}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="shrink-0">
                          <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 5 }}
                            className="text-white/40 group-hover:text-white/60 transition-colors"
                          >
                            <Icon icon="ph:arrow-right" className="w-6 h-6" />
                          </motion.div>
                        </div>
                      </div>
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