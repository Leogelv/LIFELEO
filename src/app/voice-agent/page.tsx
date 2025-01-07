'use client'

import { useTelegram } from '../hooks/useTelegram'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function VoiceAgent() {
  const { isExpanded } = useTelegram()
  const router = useRouter()

  return (
    <div className={`${isExpanded ? 'pt-[100px]' : ''}`}>
      {/* Хедер */}
      <div className="flex items-center gap-4 p-4 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[#E8D9C5]/5 transition-colors"
        >
          <Icon icon="solar:arrow-left-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
        </motion.button>
        <h1 className="text-2xl font-light text-[#E8D9C5]">Голосовой агент</h1>
      </div>

      <div className="h-[calc(100vh-140px)]">
        <iframe 
          src="https://kpcaller2.vercel.app/"
          className="w-full h-full border-0"
          allow="microphone"
        />
      </div>
    </div>
  )
} 