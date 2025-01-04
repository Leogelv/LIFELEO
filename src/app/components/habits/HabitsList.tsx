'use client'

import Link from 'next/link'

const habits = [
  {
    id: 'sport',
    title: 'Спорт',
    target: '1 час',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    gradient: 'from-orange-500 to-amber-500',
    link: '/sport'
  },
  {
    id: 'meditation',
    title: 'Медитация',
    target: '2 раза в день',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500',
    link: '/habits/meditation'
  },
  {
    id: 'water',
    title: 'Вода',
    target: '3 литра',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
    link: '/water'
  },
  {
    id: 'sleep',
    title: 'Режим сна',
    target: '22:00 - 6:00',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
      </svg>
    ),
    gradient: 'from-indigo-500 to-blue-500',
    link: '/sleep'
  }
]

export function HabitsList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {habits.map(habit => (
        <Link 
          key={habit.id}
          href={habit.link}
          className={`bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
            hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300
            flex flex-col items-center text-center group`}
        >
          <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center
            bg-gradient-to-r ${habit.gradient} bg-opacity-10 text-white
            group-hover:scale-110 transition-transform duration-300`}>
            {habit.icon}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{habit.title}</h3>
          <p className="text-gray-400">{habit.target}</p>
        </Link>
      ))}
    </div>
  )
} 