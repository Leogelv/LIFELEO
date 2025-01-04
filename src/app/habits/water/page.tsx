'use client'

import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { IoArrowBack } from 'react-icons/io5'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { AddHabitModal } from '@/app/components/habits/AddHabitModal'
import { createClient } from '@/utils/supabase/client'
import { UserIdContext } from '@/app/page'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

interface WaterSession {
  id: number
  telegram_id: number
  date: string
  amount: number
  time_of_day: string
  notes?: string
}

function WaterInput({ onAdd }: { onAdd: (amount: number) => void }) {
  const [amount, setAmount] = useState(250) // Стандартный стакан воды

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-[#2A2A2A]/50 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <Icon icon="solar:glass-water-bold" className="w-8 h-8 text-blue-400" />
        <h3 className="text-xl">Добавить воду</h3>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setAmount(prev => Math.max(50, prev - 50))}
          className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
        >
          <Icon icon="solar:minus-circle-outline" className="w-6 h-6" />
        </button>
        
        <div className="flex-1">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-2 text-center text-xl bg-[#2A2A2A] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-center mt-1 text-sm text-[#E8D9C5]/60">мл</div>
        </div>

        <button 
          onClick={() => setAmount(prev => prev + 50)}
          className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
        >
          <Icon icon="solar:add-circle-outline" className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2">
        {[250, 500, 750].map(preset => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              amount === preset 
                ? 'bg-blue-500/20 border border-blue-500/50' 
                : 'bg-[#2A2A2A] hover:bg-[#333333]'
            }`}
          >
            {preset} мл
          </button>
        ))}
      </div>

      <button
        onClick={() => onAdd(amount)}
        className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors font-medium"
      >
        Добавить
      </button>
    </div>
  )
}

export default function WaterPage() {
  const userId = useContext(UserIdContext)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [sessions, setSessions] = useState<WaterSession[]>([])

  const fetchSessions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('water_intake')
      .select('*')
      .eq('telegram_id', userId)
      .order('date', { ascending: false })

    if (data) {
      // Группируем записи по дате и суммируем количество воды
      const aggregatedData = data.reduce((acc: WaterSession[], curr) => {
        const existingSession = acc.find(session => session.date === curr.date)
        
        if (existingSession) {
          existingSession.amount += curr.amount
        } else {
          acc.push({...curr})
        }
        
        return acc
      }, [])

      setSessions(aggregatedData)
    }
  }

  const handleAddWater = async (amount: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('water_intake')
        .insert([
          {
            telegram_id: userId,
            date: new Date().toISOString().split('T')[0],
            amount,
            time_of_day: new Date().toLocaleTimeString(),
          }
        ])

      if (error) {
        console.error('Error saving water intake:', error)
        toast.error('Не удалось сохранить данные')
      } else {
        toast.success('Данные сохранены!')
        await fetchSessions()
      }
    } catch (err) {
      console.error('Error in handleAddWater:', err)
      toast.error('Произошла ошибка')
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [userId])

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E8D9C5] p-4 sm:p-8">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Шапка */}
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
          >
            <IoArrowBack className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-medium">Вода</h1>
        </div>

        {/* Ввод воды */}
        <WaterInput onAdd={handleAddWater} />

        {/* Календарь */}
        <UniversalCalendarGrid
          currentDate={new Date()}
          sessions={sessions}
          mode="water"
          onAddNow={() => setIsAddModalOpen(true)}
          onAddWithDate={() => setIsDatePickerOpen(true)}
        />
      </div>

      {/* Модальные окна */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="water"
        onSuccess={fetchSessions}
      />
      <AddHabitModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        mode="water"
        withDateTime
        onSuccess={fetchSessions}
      />
    </div>
  )
} 