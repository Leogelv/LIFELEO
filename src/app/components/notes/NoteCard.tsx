'use client'

import { useState } from 'react'
import { Note, NoteCategory } from '@/app/types/note'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const categoryConfig: Record<NoteCategory, { icon: string, color: string }> = {
  work: { icon: 'solar:briefcase-bold', color: 'text-blue-400' },
  personal: { icon: 'solar:user-bold', color: 'text-purple-400' },
  ideas: { icon: 'solar:lightbulb-bold', color: 'text-yellow-400' },
  learning: { icon: 'solar:book-bold', color: 'text-green-400' },
  health: { icon: 'solar:heart-bold', color: 'text-red-400' },
  general: { icon: 'solar:notes-bold', color: 'text-gray-400' }
}

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onAnalyze: (id: string) => void
}

export function NoteCard({ note, onEdit, onDelete, onAnalyze }: NoteCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const category = note.category || 'general'
  const { icon, color } = categoryConfig[category]
  
  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true)
      await onAnalyze(note.id)
    } catch (error) {
      console.error('Ошибка при анализе заметки:', error)
      toast.error('Не удалось проанализировать заметку')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#2A2A2A] rounded-xl p-5 border border-[#E8D9C5]/10 hover:border-[#E8D9C5]/20 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-[#E8D9C5]/10 flex items-center justify-center ${color}`}>
            <Icon icon={icon} className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#E8D9C5] line-clamp-1">{note.title}</h3>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(note)}
            className="p-2 rounded-lg hover:bg-[#E8D9C5]/10 text-[#E8D9C5]/70 hover:text-[#E8D9C5] transition-colors"
          >
            <Icon icon="solar:pen-bold" className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(note.id)}
            className="p-2 rounded-lg hover:bg-[#E8D9C5]/10 text-[#E8D9C5]/70 hover:text-[#E8D9C5] transition-colors"
          >
            <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mb-3 text-[#E8D9C5]/80 text-sm line-clamp-3">
        {note.content}
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-[#E8D9C5]/10 rounded-md text-xs text-[#E8D9C5]/70"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-[#E8D9C5]/10 rounded-md text-xs text-[#E8D9C5]/70">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {note.importance > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#E8D9C5]/70">
              <Icon icon="solar:star-bold" className="w-4 h-4 text-yellow-400" />
              <span>{note.importance}</span>
            </div>
          )}
          
          {note.urgency > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#E8D9C5]/70">
              <Icon icon="solar:alarm-bold" className="w-4 h-4 text-red-400" />
              <span>{note.urgency}</span>
            </div>
          )}
          
          <div className="text-xs text-[#E8D9C5]/50">
            {new Date(note.updated_at).toLocaleDateString()}
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 text-xs text-[#E8D9C5]/80 hover:text-[#E8D9C5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Icon icon="solar:refresh-bold" className="w-4 h-4 animate-spin" />
              <span>Анализ...</span>
            </>
          ) : note.is_analyzed ? (
            <>
              <Icon icon="solar:refresh-bold" className="w-4 h-4" />
              <span>Обновить анализ</span>
            </>
          ) : (
            <>
              <Icon icon="solar:magic-stick-bold" className="w-4 h-4" />
              <span>Анализировать</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
} 