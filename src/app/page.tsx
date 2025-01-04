'use client'

import Link from 'next/link'
import { HabitsList } from './components/habits/HabitsList'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Навигация */}
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Главная</h1>
          <Link 
            href="/contacts"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg 
              bg-gray-800/40 backdrop-blur-xl border border-gray-700/50
              hover:bg-gray-700/40 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="text-sm sm:text-base">Контакты</span>
          </Link>
        </nav>

        {/* Привычки */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">Главные привычки</h2>
          <HabitsList />
        </section>
      </div>
    </div>
  )
}
