'use client'

import { useState, useEffect } from 'react'
import { Note, NoteCategory } from '@/app/types/note'
import { NoteCard } from './NoteCard'
import { EditNoteModal } from './EditNoteModal'
import { NoteAnalysis } from './NoteAnalysis'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/utils/supabase/client'
import { useTelegram } from '@/app/hooks/useTelegram'

interface NoteListProps {
  initialNotes: Note[]
  onNotesChange?: (notes: Note[]) => void
}

export function NoteList({ initialNotes, onNotesChange }: NoteListProps) {
  const { userId } = useTelegram()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(initialNotes)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showAnalysis, setShowAnalysis] = useState<Note | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('telegram_id', userId)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Ошибка при получении заметок:', error)
          toast.error('Не удалось загрузить заметки')
        } else {
          setNotes(data || [])
          if (onNotesChange) {
            onNotesChange(data || [])
          }
        }
      } catch (error) {
        console.error('Неожиданная ошибка:', error)
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()

    // Подписка на изменения в реальном времени
    const subscription = supabase
      .channel('notes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notes', filter: `telegram_id=eq.${userId}` },
        (payload) => {
          console.log('Изменение в заметках:', payload)
          fetchNotes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, onNotesChange])

  // Фильтрация заметок при изменении поискового запроса или категории
  useEffect(() => {
    let filtered = [...notes]
    
    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }
    
    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }
    
    setFilteredNotes(filtered)
  }, [notes, searchQuery, selectedCategory])

  const handleCreateNote = () => {
    setEditingNote(null) // null означает создание новой заметки
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
  }

  const handleSaveNote = async (note: Note) => {
    try {
      let response
      
      if (note.id) {
        // Обновление существующей заметки
        response = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note)
        })
      } else {
        // Создание новой заметки
        response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note)
        })
      }
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
      }
      
      const savedNote = await response.json()
      
      // Обновляем список заметок
      setNotes(prevNotes => {
        const newNotes = note.id
          ? prevNotes.map(n => n.id === note.id ? savedNote : n)
          : [savedNote, ...prevNotes]
        
        if (onNotesChange) {
          onNotesChange(newNotes)
        }
        
        return newNotes
      })
      
      toast.success(note.id ? 'Заметка обновлена' : 'Заметка создана')
    } catch (error) {
      console.error('Ошибка при сохранении заметки:', error)
      toast.error('Не удалось сохранить заметку')
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
      }
      
      // Обновляем список заметок
      const newNotes = notes.filter(note => note.id !== id)
      setNotes(newNotes)
      
      if (onNotesChange) {
        onNotesChange(newNotes)
      }
      
      toast.success('Заметка удалена')
    } catch (error) {
      console.error('Ошибка при удалении заметки:', error)
      toast.error('Не удалось удалить заметку')
    }
  }

  const handleAnalyzeNote = async (id: string) => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch('/api/notes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: id })
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
      }
      
      const { analysis } = await response.json()
      
      // Обновляем заметку с результатами анализа
      setNotes(prevNotes => {
        const newNotes = prevNotes.map(note => {
          if (note.id === id) {
            const updatedNote = {
              ...note,
              is_analyzed: true,
              analysis,
              tags: analysis.tags,
              importance: analysis.importance,
              urgency: analysis.urgency,
              category: analysis.category
            }
            
            // Показываем анализ
            setShowAnalysis(updatedNote)
            
            return updatedNote
          }
          return note
        })
        
        if (onNotesChange) {
          onNotesChange(newNotes)
        }
        
        return newNotes
      })
      
      toast.success('Анализ заметки завершен')
    } catch (error) {
      console.error('Ошибка при анализе заметки:', error)
      toast.error('Не удалось проанализировать заметку')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const categoryOptions = [
    { value: 'all', label: 'Все', icon: 'solar:notes-bold' },
    { value: 'work', label: 'Работа', icon: 'solar:briefcase-bold' },
    { value: 'personal', label: 'Личное', icon: 'solar:user-bold' },
    { value: 'ideas', label: 'Идеи', icon: 'solar:lightbulb-bold' },
    { value: 'learning', label: 'Обучение', icon: 'solar:book-bold' },
    { value: 'health', label: 'Здоровье', icon: 'solar:heart-bold' },
    { value: 'general', label: 'Общее', icon: 'solar:notes-bold' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#E8D9C5]">Заметки</h1>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8D9C5]/20 hover:bg-[#E8D9C5]/30 text-[#E8D9C5] transition-colors"
        >
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          <span>Новая заметка</span>
        </button>
      </div>
      
      {/* Поиск и фильтры */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon icon="solar:magnifer-bold" className="w-5 h-5 text-[#E8D9C5]/50" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-[#E8D9C5]/10 rounded-lg text-[#E8D9C5] focus:outline-none focus:ring-2 focus:ring-[#E8D9C5]/30"
            placeholder="Поиск по заметкам..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#E8D9C5]/50 hover:text-[#E8D9C5] transition-colors"
            >
              <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedCategory(option.value as NoteCategory | 'all')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                selectedCategory === option.value 
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
      
      {/* Список заметок */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8D9C5]"></div>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onAnalyze={handleAnalyzeNote}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 bg-[#2A2A2A]/30 rounded-xl border border-[#E8D9C5]/10">
          <Icon icon="solar:notes-bold" className="w-16 h-16 mx-auto mb-4 text-[#E8D9C5]/30" />
          <h3 className="text-xl font-semibold mb-2 text-[#E8D9C5]">Нет заметок</h3>
          <p className="text-[#E8D9C5]/70 mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Нет заметок, соответствующих вашему запросу'
              : 'Создайте свою первую заметку, чтобы начать'}
          </p>
          <button
            onClick={handleCreateNote}
            className="px-6 py-3 bg-[#E8D9C5]/10 hover:bg-[#E8D9C5]/20 rounded-lg transition-colors text-[#E8D9C5]"
          >
            Создать заметку
          </button>
        </div>
      )}
      
      {/* Модальные окна */}
      <AnimatePresence>
        {editingNote !== undefined && editingNote !== null && (
          <EditNoteModal
            note={editingNote}
            onClose={() => setEditingNote(null)}
            onSave={handleSaveNote}
          />
        )}
        
        {showAnalysis && (
          <NoteAnalysis
            analysis={showAnalysis.analysis!}
            onClose={() => setShowAnalysis(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 