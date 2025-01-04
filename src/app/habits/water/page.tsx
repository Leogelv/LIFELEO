'use client'

import { useState } from 'react'
import { MdArrowBack } from 'react-icons/md'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UniversalCalendarGrid } from '@/app/components/habits/UniversalCalendarGrid'
import { TelegramLayout } from '@/app/components/layouts/TelegramLayout'

export default function WaterPage() {
  return (
    <TelegramLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="py-6"
        >
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
                  bg-white/5 hover:bg-white/10 transition-colors"
              >
                <MdArrowBack className="w-6 h-6" />
                <span>Назад</span>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Водный баланс
              </h1>
            </motion.div>
            <div className="w-[88px]" />
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <UniversalCalendarGrid
            currentDate={new Date()}
            sessions={[]}
            mode="water"
          />
        </motion.div>
      </div>
    </TelegramLayout>
  )
} 