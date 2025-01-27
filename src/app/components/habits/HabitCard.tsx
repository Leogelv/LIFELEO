'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useWaterSessions } from '@/app/hooks/useWaterSessions'
import { useSportSessions } from '@/app/hooks/useSportSessions'
import { useContext } from 'react'
import { UserIdContext } from '@/app/contexts/UserContext'
import { format } from 'date-fns'

interface HabitCardProps {
  icon: string
  title: string
  href: string
  gradient: string
  amount?: number
  unit?: string
  className?: string
}

export function HabitCard({ icon, title, href, gradient, amount, unit, className }: HabitCardProps) {
  const userId = useContext(UserIdContext)
  const { sessions: waterSessions } = useWaterSessions()
  const { sessions: sportSessions } = useSportSessions()

  const getStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    
    switch (title) {
      case 'Вода': {
        const todayWater = waterSessions.find(s => s.date === today)
        return todayWater ? `${(todayWater.amount / 1000).toFixed(1)} литров сегодня` : 'Нет данных'
      }
      case 'Спорт': {
        const todaySport = sportSessions
          ?.filter(s => s.date === today)
          ?.reduce((acc, s) => acc + s.duration, 0)
        return todaySport ? `${todaySport}мин тренировки` : 'Нет данных'
      }
      default:
        return null
    }
  }

  const stats = getStats()

  // Конвертируем миллилитры в литры для воды
  const displayAmount = title === 'Вода' && amount 
    ? `${(amount / 1000).toFixed(1)}` 
    : amount?.toString()

  // Определяем единицу измерения
  const displayUnit = title === 'Вода' ? 'л' : unit

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative overflow-hidden rounded-3xl p-3 sm:p-4 md:p-8 
          border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02] backdrop-blur-sm 
          hover:border-[#E8D9C5]/20 transition-all duration-500
          ${className}
        `}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-xl`} />
        <div className="relative z-10 h-full flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-4">
          <Icon icon={icon} className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-[#E8D9C5]" />
          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl md:text-2xl text-[#E8D9C5]">{title}</h2>
            {stats && (
              <p className="text-xs sm:text-sm text-[#E8D9C5]/70">{stats}</p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
} 