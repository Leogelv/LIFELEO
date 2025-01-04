import { useState, useEffect, useContext } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserIdContext } from '@/app/contexts/UserContext'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface SleepSession {
  id: number
  telegram_id: number
  date: string
  duration: number
  quality: number
  notes?: string
}

export function useSleepSessions() {
  const userId = useContext(UserIdContext)
  const [sessions, setSessions] = useState<SleepSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSessions = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      
      console.log('🔍 Fetching sleep sessions for user:', userId)
      
      const { data, error } = await supabase
        .from('sleep_tracking')
        .select('*')
        .eq('telegram_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      if (data) {
        console.log('😴 Сырые данные из базы:', data.map(d => ({
          ...d,
          dateFormatted: format(new Date(d.date), 'yyyy-MM-dd')
        })))
        
        setSessions(data)
      }
    } catch (err) {
      console.error('Error fetching sleep sessions:', err)
      toast.error('Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  const addSleep = async (duration: number, quality: number, date?: Date) => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      const sleepEntry = {
        telegram_id: userId,
        date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        duration,
        quality,
      }
      
      console.log('😴 Adding sleep entry:', sleepEntry)
      
      const { error } = await supabase
        .from('sleep_tracking')
        .insert([sleepEntry])

      if (error) throw error

      toast.success('Данные сохранены!')
      await fetchSessions()
    } catch (err) {
      console.error('Error adding sleep:', err)
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
    addSleep,
    refresh: fetchSessions
  }
} 