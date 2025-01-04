'use client'

import { DailyProgress } from './habits/DailyProgress'
import { HabitsNavigation } from './habits/HabitsNavigation'

interface ClientHomePageProps {
  totalMinutes: number
}

export function ClientHomePage({ totalMinutes }: ClientHomePageProps) {
  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Мои привычки
      </h1>

      {/* Прогресс медитации */}
      <DailyProgress totalMinutes={totalMinutes} />

      {/* Навигация по привычкам */}
      <HabitsNavigation />
    </main>
  )
} 