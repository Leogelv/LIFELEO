import { useState, useEffect, useContext } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserIdContext } from '@/app/contexts/UserContext'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface SportSession {
  id: number
  telegram_id: number
  date: string
  exercise_type: string
  duration: number
  intensity: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export function useSportSessions() {
  const userId = useContext(UserIdContext)
  const [sessions, setSessions] = useState<SportSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSessions = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      
      console.log('🔍 Fetching sport sessions for user:', userId)
      
      const { data, error } = await supabase
        .from('sport_tracking')
        .select('*')
        .eq('telegram_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      if (data) {
        console.log('🏃‍♂️ Сырые данные из базы:', data.map(d => ({
          ...d,
          dateFormatted: format(new Date(d.date), 'yyyy-MM-dd')
        })))
        
        setSessions(data)
      }
    } catch (err) {
      console.error('Error fetching sport sessions:', err)
      toast.error('Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  const addSport = async (exercise: string, duration: number, intensity: 'low' | 'medium' | 'high', date?: Date) => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      const sportEntry = {
        telegram_id: userId,
        date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        exercise_type: exercise,
        duration,
        intensity,
      }
      
      console.log('🏃‍♂️ Adding sport entry:', sportEntry)
      
      const { error } = await supabase
        .from('sport_tracking')
        .insert([sportEntry])

      if (error) throw error

      toast.success('Данные сохранены!')
      await fetchSessions()
    } catch (err) {
      console.error('Error adding sport:', err)
      toast.error('Не удалось сохранить данные')
    }
  }

  useEffect(() => {
    if (userId) {
      fetchSessions()
    }
  }, [userId])

  return {
    sessions,
    isLoading,
    addSport,
    refresh: fetchSessions
  }
} 