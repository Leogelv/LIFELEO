'use client'

import { motion } from 'framer-motion'

interface ControlButtonsProps {
  onStart: () => void
  onCancel: () => void
  onClose: () => void
  isActive: boolean
}

export function ControlButtons({ onStart, onCancel, onClose, isActive }: ControlButtonsProps) {
  return (
    <div className="space-y-4">
      {/* Основные кнопки */}
      <div className="flex gap-4 justify-center">
        {!isActive ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
              text-white font-medium transition-all duration-300
              hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            Начать
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500
              text-white font-medium transition-all duration-300
              hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Отменить
          </motion.button>
        )}
      </div>

      {/* Кнопка закрытия */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="px-4 py-2 rounded-lg bg-gray-800/50 text-gray-400
          hover:bg-gray-700/50 hover:text-gray-300 transition-all duration-200"
      >
        Закрыть
      </motion.button>
    </div>
  )
} 