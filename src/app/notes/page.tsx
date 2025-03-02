'use client'

import { useState, useEffect } from 'react'
import { SafeArea } from '@/app/components/SafeArea'
import { BottomMenu } from '@/app/components/BottomMenu'
import { NoteList } from '@/app/components/notes/NoteList'
import { Note } from '@/app/types/note'
import { supabase } from '@/utils/supabase/client'
import { useTelegram } from '@/app/hooks/useTelegram'
import { toast } from 'sonner'

export default function NotesPage() {
  const { userId } = useTelegram()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true)
        
        if (!userId) {
          toast.error('Не удалось определить пользователя')
          setIsLoading(false)
          return
        }
        
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
        }
      } catch (error) {
        console.error('Неожиданная ошибка:', error)
        toast.error('Что-то пошло не так')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchNotes()
  }, [userId])

  const handleNotesChange = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A]">
      <SafeArea className="flex-1 overflow-auto">
        <NoteList 
          initialNotes={notes} 
          onNotesChange={handleNotesChange} 
        />
      </SafeArea>
      <BottomMenu />
    </div>
  )
} 