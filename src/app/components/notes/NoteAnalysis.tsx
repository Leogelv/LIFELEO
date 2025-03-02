'use client'

import { NoteAnalysis as NoteAnalysisType } from '@/app/types/note'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useTelegram } from '@/app/hooks/useTelegram'

interface NoteAnalysisProps {
  analysis: NoteAnalysisType
  onClose: () => void
}

export function NoteAnalysis({ analysis, onClose }: NoteAnalysisProps) {
  const { safeAreaInset, isTelegramWebApp } = useTelegram()
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto"
      style={{
        paddingTop: isTelegramWebApp ? `${safeAreaInset.top}px` : '16px',
        paddingBottom: isTelegramWebApp ? `${safeAreaInset.bottom}px` : '16px',
        paddingLeft: isTelegramWebApp ? `${safeAreaInset.left}px` : '16px',
        paddingRight: isTelegramWebApp ? `${safeAreaInset.right}px` : '16px'
      }}
    >
      <div className="bg-[#1A1A1A] rounded-xl border border-[#E8D9C5]/10 w-full max-w-2xl"
        style={{
          padding: isTelegramWebApp ? 
            `${Math.max(16, safeAreaInset.top)}px ${Math.max(16, safeAreaInset.right)}px ${Math.max(16, safeAreaInset.bottom)}px ${Math.max(16, safeAreaInset.left)}px` : 
            '24px'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#E8D9C5]">Анализ заметки</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#E8D9C5]/10 text-[#E8D9C5]/70 hover:text-[#E8D9C5] transition-colors"
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Краткое содержание */}
          <div>
            <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
              <Icon icon="solar:document-text-bold" className="w-5 h-5" />
              <span>Краткое содержание</span>
            </h3>
            <p className="text-[#E8D9C5]/80 bg-[#2A2A2A] p-4 rounded-lg">
              {analysis.summary}
            </p>
          </div>
          
          {/* Теги */}
          <div>
            <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
              <Icon icon="solar:tag-bold" className="w-5 h-5" />
              <span>Теги</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1.5 bg-[#2A2A2A] rounded-lg text-sm text-[#E8D9C5]/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Важность и срочность */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
                <Icon icon="solar:star-bold" className="w-5 h-5 text-yellow-400" />
                <span>Важность</span>
              </h3>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#E8D9C5]/80">Оценка:</span>
                  <span className="text-[#E8D9C5] font-bold">{analysis.importance}/10</span>
                </div>
                <div className="w-full bg-[#E8D9C5]/10 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-400 h-2.5 rounded-full" 
                    style={{ width: `${analysis.importance * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
                <Icon icon="solar:alarm-bold" className="w-5 h-5 text-red-400" />
                <span>Срочность</span>
              </h3>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#E8D9C5]/80">Оценка:</span>
                  <span className="text-[#E8D9C5] font-bold">{analysis.urgency}/10</span>
                </div>
                <div className="w-full bg-[#E8D9C5]/10 rounded-full h-2.5">
                  <div 
                    className="bg-red-400 h-2.5 rounded-full" 
                    style={{ width: `${analysis.urgency * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Категория */}
          <div>
            <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
              <Icon icon="solar:folder-bold" className="w-5 h-5" />
              <span>Категория</span>
            </h3>
            <div className="bg-[#2A2A2A] p-4 rounded-lg">
              <span className="text-[#E8D9C5]/80 capitalize">{analysis.category}</span>
            </div>
          </div>
          
          {/* Ключевые моменты */}
          {analysis.key_points && analysis.key_points.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
                <Icon icon="solar:list-bold" className="w-5 h-5" />
                <span>Ключевые моменты</span>
              </h3>
              <ul className="bg-[#2A2A2A] p-4 rounded-lg space-y-2">
                {analysis.key_points.map((point, index) => (
                  <li key={index} className="text-[#E8D9C5]/80 flex items-start gap-2">
                    <Icon icon="solar:dot-bold" className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Действия */}
          {analysis.action_items && analysis.action_items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
                <Icon icon="solar:checklist-minimalistic-bold" className="w-5 h-5" />
                <span>Действия</span>
              </h3>
              <ul className="bg-[#2A2A2A] p-4 rounded-lg space-y-2">
                {analysis.action_items.map((item, index) => (
                  <li key={index} className="text-[#E8D9C5]/80 flex items-start gap-2">
                    <Icon icon="solar:square-bold" className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Связанные заметки */}
          {analysis.related_notes && analysis.related_notes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#E8D9C5] mb-2 flex items-center gap-2">
                <Icon icon="solar:link-bold" className="w-5 h-5" />
                <span>Связанные темы</span>
              </h3>
              <ul className="bg-[#2A2A2A] p-4 rounded-lg space-y-2">
                {analysis.related_notes.map((note, index) => (
                  <li key={index} className="text-[#E8D9C5]/80 flex items-start gap-2">
                    <Icon icon="solar:arrow-right-bold" className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#E8D9C5]/20 hover:bg-[#E8D9C5]/30 text-[#E8D9C5] transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </motion.div>
  )
} 