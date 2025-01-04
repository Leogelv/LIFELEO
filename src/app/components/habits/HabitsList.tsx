'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { RiMentalHealthLine, RiWaterFlashLine } from 'react-icons/ri'
import { GiMuscleUp } from 'react-icons/gi'
import { BsMoonStars } from 'react-icons/bs'

interface HabitsListProps {
  totalMeditationMinutes: number
}

const habits = [
  {
    id: 'meditation',
    name: 'Медитация',
    icon: RiMentalHealthLine,
    color: 'from-[#E8D9C5] to-[#C2A790]',
    href: '/habits/meditation'
  },
  {
    id: 'sport',
    name: 'Спорт',
    icon: GiMuscleUp,
    color: 'from-[#D9E8D9] to-[#90C290]',
    href: '/habits/sport'
  },
  {
    id: 'water',
    name: 'Вода',
    icon: RiWaterFlashLine,
    color: 'from-[#D9E8E8] to-[#90C2C2]',
    href: '/habits/water'
  },
  {
    id: 'sleep',
    name: 'Сон',
    icon: BsMoonStars,
    color: 'from-[#E8D9E8] to-[#C290C2]',
    href: '/habits/sleep'
  }
]

export function HabitsList({ totalMeditationMinutes }: HabitsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {habits.map((habit) => {
        const Icon = habit.icon
        const showProgress = habit.id === 'meditation'
        const progress = showProgress ? Math.min((totalMeditationMinutes / 120) * 100, 100) : 0

        return (
          <Link key={habit.id} href={habit.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-6 rounded-xl bg-[#2A2A2A]/80 backdrop-blur-xl border border-[#333333]
                hover:bg-[#2A2A2A] transition-all duration-300 overflow-hidden group"
            >
              {/* Фоновый градиент */}
              <div className={`absolute inset-0 bg-gradient-to-br ${habit.color} opacity-0 
                group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Блоб эффект */}
              <motion.div
                className="absolute -inset-2 opacity-0 group-hover:opacity-10"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${habit.color.split(' ')[1].replace('to-', '')}, transparent 70%)`
                }}
              />

              {/* Контент */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <Icon className="w-8 h-8 text-[#E8D9C5]" />
                <span className="text-sm font-light tracking-wide text-[#E8D9C5]">{habit.name}</span>

                {/* Прогресс медитации */}
                {showProgress && (
                  <div className="w-full mt-2">
                    <div className="relative h-1 bg-[#333333] rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E8D9C5] to-[#C2A790]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-[#E8D9C5]/60 text-center">
                      {totalMeditationMinutes} / 120 мин
                    </div>
                  </div>
                )}
              </div>

              {/* Блики */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                initial={false}
                style={{
                  background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06) 0%, transparent 60%)'
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              />
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
} 