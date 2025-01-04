'use client'

import { motion } from 'framer-motion'
import { format, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Icon } from '@iconify/react'

interface Todo {
  id: string
  name: string
  done: boolean
  deadline: string
  telegram_id: number
}

interface DraggableTaskProps {
  task: Todo
  onMove: (taskId: string, newDate: Date) => void
  onDrag: (taskRect: DOMRect) => void
  onDragEnd: (taskRect: DOMRect) => void
}

export function DraggableTask({ task, onMove, onDrag, onDragEnd }: DraggableTaskProps) {
  const isOverdue = !task.done && isAfter(new Date(), new Date(task.deadline))

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
        flex items-center gap-1 p-1.5 rounded-lg backdrop-blur-sm border
        cursor-move touch-none select-none text-xs
        ${task.done 
          ? 'text-[#E8D9C5]/40 line-through border-[#E8D9C5]/5 bg-gradient-to-r from-[#E8D9C5]/[0.02] to-[#E8D9C5]/[0.05]' 
          : isOverdue
            ? 'text-[#E8D9C5] border-[#E8D9C5]/30 bg-gradient-to-r from-rose-500/10 to-orange-500/10'
            : 'text-[#E8D9C5] border-[#E8D9C5]/10 bg-gradient-to-r from-[#E8D9C5]/[0.02] to-[#E8D9C5]/[0.05]'
        }
      `}
    >
      <Icon icon="solar:minimalistic-dots-vertical-outline" className="w-3 h-3 flex-shrink-0" />
      <span className="truncate" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {task.name}
      </span>
    </motion.div>
  )
} 