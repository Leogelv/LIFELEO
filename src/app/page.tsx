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
  const [taskStats, setTaskStats] = useState<TaskStats>({ overdue: 0, completed: 0, total: 0 })
  const [habitStats, setHabitStats] = useState<HabitStats>({ completedToday: 0, totalHabits: 0, streak: 0 })
  const [contactStats, setContactStats] = useState<ContactStats>({ totalContacts: 0, activeChats: 0 })

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
      className={`min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white relative ${
        isExpanded ? 'pt-[100px]' : ''
      }`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Основной градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 via-violet-200/20 to-cyan-100/20 dark:from-rose-500/10 dark:via-violet-500/10 dark:to-cyan-500/10" />
        
        {/* Анимированные круги */}
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 dark:from-purple-500/10 dark:to-pink-500/10 blur-3xl"
          animate={{
            x: [-200, 200, -200],
            y: [-200, 400, -200],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-300/20 to-blue-300/20 dark:from-cyan-500/10 dark:to-blue-500/10 blur-3xl"
          animate={{
            x: [200, -200, 200],
            y: [200, -200, 200],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Шум */}
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        delay: index * 0.2,
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      group h-full p-8 rounded-[2.5rem] bg-gradient-to-br ${item.gradient} ${item.darkGradient}
                      backdrop-blur-xl border border-white/30 dark:border-white/10
                      hover:border-white/50 dark:hover:border-white/20
                      transition-all duration-500 relative overflow-hidden
                      shadow-lg hover:shadow-2xl
                    `}
                  >
                    {/* Animated Glow Effect */}
                    <motion.div
                      className="absolute -inset-2 opacity-0 group-hover:opacity-100 duration-500 transition-opacity"
                      style={{
                        background: `radial-gradient(circle at center, ${item.glowColor} 0%, transparent 70%)`
                      }}
                    />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: item.particleColor,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [-20, 20, -20],
                            x: [-20, 20, -20],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Animated Icon */}
                      <motion.div 
                        className="mb-6 relative w-16 h-16"
                        whileHover="hover"
                      >
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          variants={{
                            hover: { 
                              opacity: 0,
                              scale: 0.5,
                              rotate: -180,
                              transition: { duration: 0.3 }
                            }
                          }}
                        >
                          <Icon 
                            icon={item.icon} 
                            className="w-16 h-16 text-white/90 drop-shadow-lg" 
                          />
                        </motion.div>
                        
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
                          variants={{
                            hover: { 
                              opacity: 1,
                              scale: 1,
                              rotate: 0,
                              transition: { duration: 0.3 }
                            }
                          }}
                        >
                          <Icon 
                            icon={item.iconSecondary} 
                            className="w-16 h-16 text-white/90 drop-shadow-lg" 
                          />
                        </motion.div>
                      </motion.div>
                      
                      <motion.h2 
                        className="text-3xl font-extralight tracking-wide mb-3 text-white/90"
                        whileHover={{
                          letterSpacing: "0.2em",
                          transition: { duration: 0.3 }
                        }}
                      >
                        {item.title}
                      </motion.h2>
                      
                      <p className="text-base text-white/70 font-light leading-relaxed mb-6">
                        {item.description}
                      </p>

                      {/* Stats Section */}
                      <div className="mt-auto">
                        {item.href === '/tasks' && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Icon icon="ph:clock-countdown-duotone" className="w-5 h-5 text-white/60" />
                              <span className="text-sm text-white/60">{taskStats.overdue} просрочено</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon icon="ph:check-circle-duotone" className="w-5 h-5 text-white/60" />
                              <span className="text-sm text-white/60">{taskStats.completed}/{taskStats.total}</span>
                            </div>
                          </div>
                        )}

                        {item.href === '/habits' && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Icon icon="ph:chart-line-up-duotone" className="w-5 h-5 text-white/60" />
                              <span className="text-sm text-white/60">{habitStats.completedToday}/{habitStats.totalHabits} сегодня</span>
                            </div>
                            {habitStats.streak > 0 && (
                              <div className="flex items-center gap-2">
                                <Icon icon="ph:flame-duotone" className="w-5 h-5 text-white/60" />
                                <span className="text-sm text-white/60">{habitStats.streak}д серия</span>
                              </div>
                            )}
                          </div>
                        )}

                        {item.href === '/contacts' && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Icon icon="ph:users-three-duotone" className="w-5 h-5 text-white/60" />
                              <span className="text-sm text-white/60">{contactStats.totalContacts} контактов</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon icon="ph:chat-circle-dots-duotone" className="w-5 h-5 text-white/60" />
                              <span className="text-sm text-white/60">{contactStats.activeChats} активных</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover Arrow */}
                      <motion.div
                        className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <Icon 
                          icon="game-icons:arrow-dunk" 
                          className="w-8 h-8 text-white/70" 
                        />
                      </motion.div>
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