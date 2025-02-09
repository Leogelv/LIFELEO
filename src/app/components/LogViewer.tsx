'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '@/utils/logger'
import { MdClose, MdRefresh, MdDelete } from 'react-icons/md'

export default function LogViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Обновляем логи каждую секунду если окно открыто
    if (isOpen) {
      const interval = setInterval(() => {
        setLogs(logger.getLogs())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const handleClearLogs = () => {
    logger.clearLogs()
    setLogs([])
  }

  const handleRefresh = () => {
    setLogs(logger.getLogs())
  }

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-black/90 backdrop-blur-lg 
          rounded-xl text-white/80 hover:text-white z-50 transition-colors
          hidden sm:block"
      >
        LOGS
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-4 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-medium">Debug Logs</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <MdRefresh className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClearLogs}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-rose-400"
          >
            <MdDelete className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <div className="space-y-2">
          {logs.map((log, index) => {
            const isError = log.includes('[ERROR]')
            const isWarn = log.includes('[WARN]')
            const isDebug = log.includes('[DEBUG]')

            return (
              <div
                key={index}
                className={`p-2 rounded ${
                  isError 
                    ? 'bg-rose-950/50 text-rose-400'
                    : isWarn
                    ? 'bg-yellow-950/50 text-yellow-400'
                    : isDebug
                    ? 'bg-blue-950/50 text-blue-400'
                    : 'bg-white/5'
                }`}
              >
                <pre className="whitespace-pre-wrap break-words">{log}</pre>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
} 