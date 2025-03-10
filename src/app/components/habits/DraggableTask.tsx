'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { format, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { Todo } from '@/types/todo'

interface DraggableTaskProps {
  task: Todo
  onMove: (taskId: string, newDate: Date) => void
  onDrag: (taskRect: DOMRect) => void
  onDragEnd: (taskRect: DOMRect) => void
}

export function DraggableTask({ task, onMove, onDrag, onDragEnd }: DraggableTaskProps) {
  const isOverdue = !task.done && isAfter(new Date(), new Date(task.deadline))
  const [showNotes, setShowNotes] = useState(false)

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.2}
      whileDrag={{
        scale: 1.1,
        zIndex: 9999,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
      onDrag={(event, info) => {
        const element = event.target as HTMLElement
        const rect = element.getBoundingClientRect()
        onDrag(rect)
      }}
      onDragEnd={(event) => {
        const element = event.target as HTMLElement
        const rect = element.getBoundingClientRect()
        onDragEnd(rect)
      }}
      className={`
        relative flex flex-col gap-1 p-1.5 rounded-lg backdrop-blur-sm border
        cursor-move touch-none select-none text-[10px] sm:text-xs
        ${task.done 
          ? 'text-[#E8D9C5]/80 line-through border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5' 
          : isOverdue
            ? 'text-[#E8D9C5] border-[#E8D9C5]/30 bg-gradient-to-r from-rose-500/10 to-orange-500/10'
            : 'text-[#E8D9C5] border-[#E8D9C5]/10 bg-gradient-to-r from-[#E8D9C5]/[0.02] to-[#E8D9C5]/[0.05]'
        }
      `}
    >
      <div className="flex items-center gap-1">
        <Icon icon="solar:minimalistic-dots-vertical-outline" className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
        <span className="break-words" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          {task.name}
        </span>
        {task.notes && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowNotes(!showNotes)
            }}
            className="ml-auto"
          >
            <Icon 
              icon="solar:notes-outline" 
              className={`w-3 h-3 transition-colors ${showNotes ? 'text-[#E8D9C5]' : 'text-[#E8D9C5]/60'}`} 
            />
          </button>
        )}
      </div>
      
      {/* Заметка */}
      <AnimatePresence>
        {showNotes && task.notes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-[#E8D9C5]/60 mt-1 border-t border-[#E8D9C5]/10 pt-1"
          >
            {task.notes}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 