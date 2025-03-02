'use client'

import { useState, useEffect } from 'react'
import { Note, NoteCategory } from '@/app/types/note'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useTelegram } from '@/app/hooks/useTelegram'

const categoryOptions: { value: NoteCategory, label: string, icon: string }[] = [
  { value: 'work', label: 'Работа', icon: 'solar:briefcase-bold' },
  { value: 'personal', label: 'Личное', icon: 'solar:user-bold' },
  { value: 'ideas', label: 'Идеи', icon: 'solar:lightbulb-bold' },
  { value: 'learning', label: 'Обучение', icon: 'solar:book-bold' },
  { value: 'health', label: 'Здоровье', icon: 'solar:heart-bold' },
  { value: 'general', label: 'Общее', icon: 'solar:notes-bold' }
]

interface EditNoteModalProps {
  note: Note | null
  onClose: () => void
  onSave: (note: Note) => void
}

export function EditNoteModal({ note, onClose, onSave }: EditNoteModalProps) {
  const { userId, safeAreaInset, isTelegramWebApp } = useTelegram()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<NoteCategory>('general')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [importance, setImportance] = useState(0)
  const [urgency, setUrgency] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setCategory(note.category || 'general')
      setTags(note.tags || [])
      setImportance(note.importance || 0)
      setUrgency(note.urgency || 0)
    } else {
      // Значения по умолчанию для новой заметки
      setTitle('')
      setContent('')
      setCategory('general')
      setTags([])
      setImportance(0)
      setUrgency(0)
    }
  }, [note])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Введите заголовок заметки')
      return
    }

    try {
      setIsSaving(true)
      
      const updatedNote: Note = {
        id: note?.id || '',
        telegram_id: userId,
        title: title.trim(),
        content: content.trim(),
        created_at: note?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags,
        importance,
        urgency,
        category,
        is_analyzed: note?.is_analyzed || false,
        analysis: note?.analysis || null
      }
      
      await onSave(updatedNote)
      onClose()
    } catch (error) {
      console.error('Ошибка при сохранении заметки:', error)
      toast.error('Не удалось сохранить заметку')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto"
      style={{
        paddingTop: isTelegramWebApp ? `${safeAreaInset.top}px` : '0px',
        paddingBottom: isTelegramWebApp ? `${safeAreaInset.bottom}px` : '0px',
        paddingLeft: isTelegramWebApp ? `${safeAreaInset.left}px` : '0px',
        paddingRight: isTelegramWebApp ? `${safeAreaInset.right}px` : '0px'
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1A1A1A] rounded-xl border border-[#E8D9C5]/10 w-full max-w-2xl mx-4 my-8"
        style={{
          padding: isTelegramWebApp ? 
            `${Math.max(16, safeAreaInset.top)}px ${Math.max(16, safeAreaInset.right)}px ${Math.max(16, safeAreaInset.bottom)}px ${Math.max(16, safeAreaInset.left)}px` : 
            '24px'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#E8D9C5]">
            {note ? 'Редактировать заметку' : 'Новая заметка'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#E8D9C5]/10 text-[#E8D9C5]/70 hover:text-[#E8D9C5] transition-colors"
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Заголовок */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#E8D9C5]/70 mb-1">
              Заголовок
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#E8D9C5]/10 rounded-lg text-[#E8D9C5] focus:outline-none focus:ring-2 focus:ring-[#E8D9C5]/30"
              placeholder="Введите заголовок заметки"
            />
          </div>
          
          {/* Содержание */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-[#E8D9C5]/70 mb-1">
              Содержание
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#E8D9C5]/10 rounded-lg text-[#E8D9C5] focus:outline-none focus:ring-2 focus:ring-[#E8D9C5]/30 min-h-[200px]"
              placeholder="Введите содержание заметки"
            />
          </div>
          
          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-[#E8D9C5]/70 mb-1">
              Категория
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    category === option.value 
                      ? 'bg-[#E8D9C5]/20 border-[#E8D9C5]/30 text-[#E8D9C5]' 
                      : 'bg-[#2A2A2A] border-[#E8D9C5]/10 text-[#E8D9C5]/70 hover:bg-[#E8D9C5]/10'
                  } transition-colors`}
                >
                  <Icon icon={option.icon} className="w-5 h-5" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Теги */}
          <div>
            <label className="block text-sm font-medium text-[#E8D9C5]/70 mb-1">
              Теги
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-4 py-2 bg-[#2A2A2A] border border-[#E8D9C5]/10 rounded-lg text-[#E8D9C5] focus:outline-none focus:ring-2 focus:ring-[#E8D9C5]/30"
                placeholder="Добавить тег"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#2A2A2A] border border-[#E8D9C5]/10 rounded-lg text-[#E8D9C5]/70 hover:text-[#E8D9C5] hover:bg-[#E8D9C5]/10 transition-colors"
              >
                <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#2A2A2A] rounded-lg text-sm text-[#E8D9C5]/80"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[#E8D9C5]/50 hover:text-[#E8D9C5] transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Важность и срочность */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#E8D9C5]/70 mb-1">
                Важность (0-10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={importance}
                  onChange={(e) => setImportance(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-center text-[#E8D9C5]">{importance}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#E8D9C5]/70 mb-1">
                Срочность (0-10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={urgency}
                  onChange={(e) => setUrgency(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-center text-[#E8D9C5]">{urgency}</span>
              </div>
            </div>
          </div>
          
          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E8D9C5]/10 text-[#E8D9C5]/70 hover:text-[#E8D9C5] hover:bg-[#E8D9C5]/10 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-[#E8D9C5]/20 hover:bg-[#E8D9C5]/30 text-[#E8D9C5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Icon icon="solar:refresh-bold" className="w-5 h-5 animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : (
                <>
                  <Icon icon="solar:disk-bold" className="w-5 h-5" />
                  <span>Сохранить</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 