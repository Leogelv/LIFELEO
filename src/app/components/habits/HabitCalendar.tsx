import { useState } from 'react'
import { UniversalCalendarGrid } from './UniversalCalendarGrid'

interface HabitCalendarProps {
  mode: 'meditation' | 'sport' | 'water' | 'general'
  sessions: any[] // Тип зависит от режима
}

export function HabitCalendar({ mode, sessions }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div className="w-full space-y-4">
      <UniversalCalendarGrid
        currentDate={currentDate}
        sessions={sessions}
        mode={mode}
      />
    </div>
  )
} 