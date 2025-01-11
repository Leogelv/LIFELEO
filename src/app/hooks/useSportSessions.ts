import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserIdContext } from '@/app/contexts/UserContext'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import debounce from 'lodash/debounce'

interface SportSession {
  id: number
  telegram_id: number
  date: string
  exercise_type: string
  duration: number
  intensity: string
  notes?: string
}

export function useSportSessions() {
  const userId = useContext(UserIdContext)
  const [sessions, setSessions] = useState<SportSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      
      console.log('🔍 Fetching sport sessions for user:', userId)
      
      const { data, error } = await supabase
        .from('sport_sessions')
        .select('*')
        .eq('telegram_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      if (data) {
        console.log('📊 Raw data from DB:', data)
        
        const formattedData = data.map(session => {
          const date = new Date(session.date)
          console.log('📅 Processing date:', {
            original: session.date,
            parsed: date,
            offset: date.getTimezoneOffset(),
            timestamp: date.getTime()
          })
          
          const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          const formattedDate = localDate.toISOString().split('T')[0]
          
          console.log('🎯 Formatted date:', {
            localDate,
            formattedDate
          })
          
          return {
            ...session,
            date: formattedDate
          }
        })
        
        console.log('🏃‍♂️ Final formatted data:', formattedData)
        setSessions(formattedData)
      }
    } catch (err) {
      console.error('Error fetching sport sessions:', err)
      toast.error('Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const debouncedFetch = useMemo(
    () => debounce(fetchSessions, 1000),
    [fetchSessions]
  )

  useEffect(() => {
    if (userId) {
      debouncedFetch()
    }
    return () => {
      debouncedFetch.cancel()
    }
  }, [userId, debouncedFetch])

  const addSport = async (exercise: string, duration: number, intensity: 'low' | 'medium' | 'high', date?: Date) => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      const formattedDate = date 
        ? format(date, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')
        
      console.log('📝 Adding sport entry:', {
        providedDate: date,
        formattedDate,
        exercise,
        duration
      })
      
      const sportEntry = {
        telegram_id: userId,
        date: formattedDate,
        exercise_type: exercise,
        duration,
        intensity,
      }
      
      const { error } = await supabase
        .from('sport_sessions')
        .insert([sportEntry])

      if (error) throw error

      toast.success('Данные сохранены!')
      await fetchSessions()
    } catch (err) {
      console.error('Error adding sport:', err)
      toast.error('Не удалось сохранить данные')
    }
  }

  return useMemo(() => ({
    sessions,
    isLoading,
    addSport,
    refresh: fetchSessions
  }), [sessions, isLoading, userId, fetchSessions])
} 