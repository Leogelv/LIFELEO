'use client'

import { useState } from 'react'
import { UniversalCalendarGrid } from './UniversalCalendarGrid'

export interface HabitCalendarProps {
  mode: 'meditation' | 'sport' | 'water' | 'sleep' | 'general'
  sessions: any[]
}

export function HabitCalendar({ mode, sessions }: HabitCalendarProps) {
  const [currentDate] = useState(new Date())

  return (
    <div className="w-full">
      <UniversalCalendarGrid 
        mode={mode}
        currentDate={currentDate}
        sessions={sessions}
      />
    </div>
  )
} 