'use client'

import Link from 'next/link'
import { GlowingParticles } from './components/ui/GlowingParticles'
import { RiMentalHealthLine, RiMoneyDollarCircleLine } from 'react-icons/ri'
import { GiMuscleUp } from 'react-icons/gi'
import { IoWaterOutline } from 'react-icons/io5'
import { BsMoonStars } from 'react-icons/bs'
import { MdOutlineContactPage, MdOutlineTaskAlt } from 'react-icons/md'

const habits = [
  {
    name: 'Медитация',
    icon: RiMentalHealthLine,
    href: '/habits/meditation',
    progress: '120 / 120 мин',
    color: 'from-purple-400/20 to-fuchsia-400/20'
  },
  {
    name: 'Спорт',
    icon: GiMuscleUp,
    href: '/habits/sport',
    color: 'from-emerald-400/20 to-green-400/20'
  },
  {
    name: 'Вода',
    icon: IoWaterOutline,
    href: '/habits/water',
    color: 'from-blue-400/20 to-cyan-400/20'
  },
  {
    name: 'Сон',
    icon: BsMoonStars,
    href: '/habits/sleep',
    color: 'from-indigo-400/20 to-violet-400/20'
  },
  {
    name: 'Финансы',
    icon: RiMoneyDollarCircleLine,
    href: '/habits/finance',
    color: 'from-amber-400/20 to-yellow-400/20'
  },
  {
    name: 'Задачи',
    icon: MdOutlineTaskAlt,
    href: '/habits/tasks',
    color: 'from-rose-400/20 to-pink-400/20'
  }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-[#E8D9C5] p-4 sm:p-8">
      <GlowingParticles />
      
      <div className="max-w-6xl mx-auto">
        {/* Верхняя панель */}
        <div className="flex justify-end mb-12">
          <Link
            href="/contacts"
            className="flex items-center gap-2 px-6 py-3 text-lg rounded-xl bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 transition-colors"
          >
            <MdOutlineContactPage className="w-6 h-6" />
            <span>Контакты</span>
          </Link>
        </div>

        {/* Сетка привычек */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const Icon = habit.icon
            return (
              <Link
                key={habit.name}
                href={habit.href}
                className="group relative h-[180px] p-6 rounded-2xl bg-[#2A2A2A]/80 backdrop-blur-xl 
                  border border-[#333333] overflow-hidden hover:border-[#E8D9C5]/20 transition-colors"
              >
                {/* Градиентный фон */}
                <div className={`absolute inset-0 bg-gradient-to-br ${habit.color} opacity-0 
                  group-hover:opacity-100 transition-opacity duration-500`} 
                />

                {/* Контент */}
                <div className="relative flex flex-col h-full">
                  <Icon className="w-8 h-8 mb-4" />
                  <h2 className="text-xl font-medium mb-2">{habit.name}</h2>
                  {habit.progress && (
                    <div className="mt-auto">
                      <div className="h-1 bg-[#E8D9C5]/10 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-[#E8D9C5]/30 rounded-full" />
                      </div>
                      <p className="text-sm text-[#E8D9C5]/60 mt-2">{habit.progress}</p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
