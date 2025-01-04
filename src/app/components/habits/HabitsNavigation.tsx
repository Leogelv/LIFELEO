import Link from 'next/link'
import { motion } from 'framer-motion'

const habits = [
  {
    id: 'meditation',
    name: 'Медитация',
    icon: '🧘‍♂️',
    color: 'from-purple-500 to-fuchsia-500',
    href: '/habits/meditation'
  },
  {
    id: 'sport',
    name: 'Спорт',
    icon: '💪',
    color: 'from-emerald-500 to-teal-500',
    href: '/habits/sport'
  },
  {
    id: 'water',
    name: 'Вода',
    icon: '💧',
    color: 'from-blue-500 to-cyan-500',
    href: '/habits/water'
  },
  {
    id: 'sleep',
    name: 'Сон',
    icon: '😴',
    color: 'from-indigo-500 to-blue-500',
    href: '/habits/sleep'
  }
]

export function HabitsNavigation() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {habits.map((habit) => (
        <Link key={habit.id} href={habit.href}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700/50
              hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300 overflow-hidden
              cursor-pointer group`}
          >
            {/* Фоновый градиент */}
            <div className={`absolute inset-0 bg-gradient-to-br ${habit.color} opacity-0 
              group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Контент */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="text-3xl">{habit.icon}</span>
              <span className="text-sm font-medium text-gray-200">{habit.name}</span>
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
      ))}
    </div>
  )
} 