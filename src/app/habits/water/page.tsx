'use client'

import { useState } from 'react'
import { WaterCalendarGrid } from '@/app/components/habits/WaterCalendarGrid'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useWaterSessions } from '@/app/hooks/useWaterSessions'

function WaterInput({ onAdd }: { onAdd: (amount: number) => void }) {
  const [amount, setAmount] = useState(250)

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-[#2A2A2A]/50 backdrop-blur-lg mb-8">
      <div className="flex items-center gap-4">
        <Icon icon="solar:glass-water-bold" className="w-8 h-8 text-blue-400" />
        <h3 className="text-xl font-light text-[#E8D9C5]">Добавить воду</h3>
      </div>
      
      <div className="flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setAmount(prev => Math.max(50, prev - 50))}
          className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
        >
          <Icon icon="solar:minus-circle-outline" className="w-6 h-6 text-[#E8D9C5]" />
        </motion.button>
        
        <div className="flex-1">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-2 text-center text-xl bg-[#2A2A2A] text-[#E8D9C5] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-center mt-1 text-sm text-[#E8D9C5]/60">мл</div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setAmount(prev => prev + 50)}
          className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] transition-colors"
        >
          <Icon icon="solar:add-circle-outline" className="w-6 h-6 text-[#E8D9C5]" />
        </motion.button>
      </div>

      <div className="flex gap-2">
        {[250, 500, 750].map(preset => (
          <motion.button
            key={preset}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmount(preset)}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              amount === preset 
                ? 'bg-blue-500/20 border border-blue-500/50' 
                : 'bg-[#2A2A2A] hover:bg-[#333333]'
            }`}
          >
            {preset} мл
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onAdd(amount)}
        className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors font-medium text-white"
      >
        Добавить
      </motion.button>
    </div>
  )
}

export default function WaterPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { sessions, addWater, isLoading } = useWaterSessions()

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-4 md:p-8">
      {/* Хедер */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
        >
          <Icon icon="solar:arrow-left-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
        </motion.button>
        <h1 className="text-2xl font-light text-[#E8D9C5]">Вода</h1>
      </div>

      {/* Ввод воды */}
      <WaterInput onAdd={addWater} />

      {/* Календарь */}
      <div className="max-w-4xl mx-auto">
        <WaterCalendarGrid 
          currentDate={currentDate}
          sessions={sessions}
        />
      </div>
    </div>
  )
} 