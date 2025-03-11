'use client'

import { useEffect, useState, useMemo } from 'react'
import { logger } from '@/utils/logger'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram } from './hooks/useTelegram'
import { useUsername } from './contexts/UserIdContext'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { realtime } from '@/utils/realtime'
import { habitsRealtime } from '@/utils/habits-realtime'
import { SafeArea } from './components/SafeArea'
import { BottomMenu } from './components/BottomMenu'
import dynamic from 'next/dynamic'
import { initPerformanceOptimizations } from '@/utils/performance'

// Оптимизация: ленивая загрузка тяжелых компонентов
const LazyIcon = dynamic(() => import('@iconify/react').then(mod => mod.Icon), {
  loading: () => <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>,
  ssr: false
})

// Оптимизация: мемоизация данных
const SECTIONS = [
  {
    id: 'tasks',
    title: 'Задачи',
    icon: 'solar:checklist-minimalistic-bold',
    color: 'rose',
    gradient: 'from-rose-500/20 to-orange-500/20',
    border: 'border-rose-500/20 hover:border-rose-500/30',
    iconBg: 'bg-rose-500/20',
    textColor: 'text-rose-400',
    description: 'Управляй задачами и отслеживай прогресс'
  },
  {
    id: 'habits',
    title: 'Привычки',
    icon: 'solar:star-bold',
    color: 'purple',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/20 hover:border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    description: 'Формируй полезные привычки'
  },
  {
    id: 'notes',
    title: 'Заметки',
    icon: 'solar:notes-bold',
    color: 'amber',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/20 hover:border-amber-500/30',
    iconBg: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    description: 'Создавай и анализируй заметки с ИИ'
  },
  {
    id: 'contacts',
    title: 'Контакты',
    icon: 'solar:users-group-rounded-bold',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20 hover:border-cyan-500/30',
    iconBg: 'bg-cyan-500/20',
    textColor: 'text-cyan-400',
    description: 'Управляй контактами'
  },
  {
    id: 'voicebot',
    title: 'Голосовой бот',
    icon: 'solar:microphone-bold',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20 hover:border-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    description: 'Общайся с ИИ-ассистентом голосом'
  }
]

const UTILITIES = [
  {
    id: 'settings',
    title: 'Настройки',
    icon: 'solar:settings-bold'
  },
  {
    id: 'stats',
    title: 'Статистика',
    icon: 'solar:chart-bold'
  },
  {
    id: 'help',
    title: 'Помощь',
    icon: 'solar:question-circle-bold'
  }
]

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

// Определяем интерфейсы для секций и утилит
interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  border: string;
  iconBg: string;
  textColor: string;
  description: string;
}

interface Utility {
  id: string;
  title: string;
  icon: string;
}

// Оптимизированный компонент секции
const SectionCard = ({ section, priority = false }: { section: Section, priority?: boolean }) => (
  <Link href={`/${section.id}`} className="block" prefetch={false}>
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br ${section.gradient} rounded-xl p-5 border ${section.border} transition-all h-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="flex items-center mb-3">
        <div className={`w-10 h-10 rounded-full ${section.iconBg} flex items-center justify-center mr-3`}>
          <LazyIcon icon={section.icon} className={`w-5 h-5 ${section.textColor}`} />
        </div>
        <h2 className={`text-lg font-semibold ${section.textColor}`}>{section.title}</h2>
      </div>
      <p className="text-[#E8D9C5]/70 text-sm">{section.description}</p>
    </motion.div>
  </Link>
)

// Оптимизированный компонент утилиты
const UtilityCard = ({ utility }: { utility: Utility }) => (
  <Link href={`/${utility.id}`} className="block" prefetch={false}>
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#2A2A2A] rounded-xl p-4 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center mb-2">
          <LazyIcon icon={utility.icon} className="w-5 h-5 text-[#E8D9C5]" />
        </div>
        <h3 className="text-sm font-medium">{utility.title}</h3>
      </div>
    </motion.div>
  </Link>
)

// Оптимизированная главная страница
export default function Home() {
  const { user, isTelegramWebApp, safeAreaInset } = useTelegram()
  const contextUsername = useUsername()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  
  // Используем имя пользователя из контекста в приоритете
  const effectiveUsername = contextUsername !== 'Пользователь' ? contextUsername : user.username
  
  // Оптимизация: предотвращаем ненужные ререндеры
  useEffect(() => {
    setMounted(true)
    
    // Инициализируем оптимизации производительности
    if (typeof window !== 'undefined') {
      initPerformanceOptimizations();
      
      // Определяем, является ли устройство слабым
      const isLowEnd = 'deviceMemory' in navigator && 
        // @ts-ignore - deviceMemory не включен в стандартные типы
        (navigator.deviceMemory < 4 || navigator.hardwareConcurrency < 4);
      
      setIsLowEndDevice(isLowEnd);
    }
    
    // Обновляем время каждую минуту
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Получаем приветствие в зависимости от времени суток
  const getGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  }, [currentTime]);

  // Оптимизация: мемоизируем стили для отступов
  const containerStyle = useMemo(() => isTelegramWebApp ? {
    paddingTop: `${Math.max(safeAreaInset.top, 16)}px`,
    paddingBottom: `${Math.max(safeAreaInset.bottom, 16)}px`,
    paddingLeft: `${Math.max(safeAreaInset.left, 16)}px`,
    paddingRight: `${Math.max(safeAreaInset.right, 16)}px`
  } : {}, [isTelegramWebApp, safeAreaInset]);

  // Оптимизация: мемоизируем форматированную дату
  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }, [currentTime]);

  // Оптимизация: мемоизируем форматированное время
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [currentTime]);

  // Оптимизация: упрощаем анимации для слабых устройств
  const animationProps = useMemo(() => {
    if (isLowEndDevice) {
      return {
        transition: { duration: 0.1 },
        animate: { opacity: 1, y: 0, x: 0, scale: 1 },
      };
    }
    
    return {
      transition: { duration: 0.3 },
      animate: { opacity: 1, y: 0, x: 0, scale: 1 },
    };
  }, [isLowEndDevice]);

  // Оптимизация: предотвращаем гидрацию
  if (!mounted) {
    return null;
  }

  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-6" style={containerStyle}>
          {/* Заголовок и время */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={animationProps.animate}
            transition={animationProps.transition}
          >
            <motion.h1 
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E8D9C5] to-[#E8D9C5]/60"
              initial={{ x: -20, opacity: 0 }}
              animate={animationProps.animate}
              transition={animationProps.transition}
            >
              LIFELEO
            </motion.h1>
            <motion.div 
              className="text-right"
              initial={{ x: 20, opacity: 0 }}
              animate={animationProps.animate}
              transition={animationProps.transition}
            >
              <p className="text-[#E8D9C5]/60 text-sm">
                {formattedDate}
              </p>
              <p className="text-[#E8D9C5]/80 text-lg font-medium">
                {formattedTime}
              </p>
            </motion.div>
          </motion.div>

          {/* Приветствие */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={animationProps.animate}
            transition={animationProps.transition}
          >
            <motion.div 
              className="bg-gradient-to-r from-[#2A2A2A] to-[#222222] rounded-xl p-6 border border-[#E8D9C5]/10 shadow-lg"
            >
              <motion.p 
                className="text-2xl font-medium mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#E8D9C5] to-[#E8D9C5]/80"
                initial={{ y: -10, opacity: 0 }}
                animate={animationProps.animate}
                transition={{ ...animationProps.transition, delay: isLowEndDevice ? 0 : 0.2 }}
              >
                {getGreeting}, {effectiveUsername}!
              </motion.p>
              <motion.p 
                className="text-[#E8D9C5]/70"
                initial={{ y: 10, opacity: 0 }}
                animate={animationProps.animate}
                transition={{ ...animationProps.transition, delay: isLowEndDevice ? 0 : 0.3 }}
              >
                Что будем делать сегодня?
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Основные разделы */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={animationProps.animate}
            transition={{ ...animationProps.transition, delay: isLowEndDevice ? 0 : 0.2 }}
          >
            {SECTIONS.slice(0, 4).map((section, index) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={animationProps.animate}
                transition={{ 
                  ...animationProps.transition, 
                  delay: isLowEndDevice ? 0 : 0.1 * index 
                }}
              >
                <SectionCard section={section} priority={index < 2} />
              </motion.div>
            ))}
          </motion.div>

          {/* Голосовой бот */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={animationProps.animate}
            transition={{ ...animationProps.transition, delay: isLowEndDevice ? 0 : 0.5 }}
          >
            <SectionCard section={SECTIONS[4]} />
          </motion.div>

          {/* Дополнительные функции */}
          <motion.div 
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={animationProps.animate}
            transition={{ ...animationProps.transition, delay: isLowEndDevice ? 0 : 0.6 }}
          >
            {UTILITIES.map((utility, index) => (
              <motion.div 
                key={utility.id}
                initial={{ opacity: 0, y: 10 }}
                animate={animationProps.animate}
                transition={{ 
                  ...animationProps.transition, 
                  delay: isLowEndDevice ? 0 : 0.6 + (0.1 * index) 
                }}
              >
                <UtilityCard utility={utility} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SafeArea>
      <BottomMenu />
    </>
  )
}