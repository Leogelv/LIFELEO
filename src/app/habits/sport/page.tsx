'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IoArrowBack } from 'react-icons/io5'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { AddHabitModal } from '@/app/components/habits/AddHabitModal'
import { createClient } from '@/utils/supabase/client'

interface SportSession {
  id: number
  telegram_id: number
  date: string
  exercise_type: string
  duration: number
  intensity: 'low' | 'medium' | 'high'
  notes?: string
}

export default function SportPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [sessions, setSessions] = useState<SportSession[]>([])

  const fetchSessions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('sport_sessions')
      .select('*')
      .order('date', { ascending: false })

    if (data) {
      setSessions(data)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E8D9C5] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Шапка */}
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
          >
            <IoArrowBack className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-medium">Спорт</h1>
        </div>

        {/* Календарь */}
        <UniversalCalendarGrid
          currentDate={new Date()}
          sessions={sessions}
          mode="sport"
          onAddNow={() => setIsAddModalOpen(true)}
          onAddWithDate={() => setIsDatePickerOpen(true)}
        />
      </div>

      {/* Модальные окна */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="sport"
        onSuccess={fetchSessions}
      />
      <AddHabitModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        mode="sport"
        withDateTime
        onSuccess={fetchSessions}
      />
    </div>
  )
} 