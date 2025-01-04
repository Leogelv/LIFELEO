'use client'

import { RiMoneyDollarCircleLine } from 'react-icons/ri'

export default function FinancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <RiMoneyDollarCircleLine className="w-24 h-24 mx-auto text-amber-400/60 animate-pulse" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
          Финансовый трекер
        </h1>
        <p className="text-xl text-white/60">
          Скоро здесь появится возможность отслеживать свои финансы 💰
        </p>
      </div>
    </div>
  )
} 