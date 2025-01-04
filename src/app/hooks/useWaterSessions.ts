import { useState, useEffect, useContext } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserIdContext } from '@/app/contexts/UserContext'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface WaterSession {
  id: number
  telegram_id: number
  date: string
  amount: number
  time_of_day: string
  notes?: string
}

export function useWaterSessions() {
  const userId = useContext(UserIdContext)
  const [sessions, setSessions] = useState<WaterSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSessions = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const supabase = createClient()
      
      console.log('🔍 Fetching water sessions for user:', userId)
      
      const { data, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('telegram_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      if (data) {
        console.log('🌊 Сырые данные из базы:', data.map(d => ({
          ...d,
          dateFormatted: format(new Date(d.date), 'yyyy-MM-dd')
        })))

        // Группируем записи по дате и суммируем количество воды
        const aggregatedData = data.reduce((acc: WaterSession[], curr) => {
          const existingSession = acc.find(session => session.date === curr.date)
          
          if (existingSession) {
            existingSession.amount += curr.amount
          } else {
            acc.push({...curr})
          }
          
          return acc
        }, [])

        console.log('🌊 После агрегации:', aggregatedData.map(d => ({
          date: d.date,
          dateFormatted: format(new Date(d.date), 'yyyy-MM-dd'),
          amount: d.amount
        })))
        
        setSessions(aggregatedData)
      }
    } catch (err) {
      console.error('Error fetching water sessions:', err)
      toast.error('Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  const addWater = async (amount: number, date?: Date) => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      const waterEntry = {
        telegram_id: userId,
        date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        amount,
        time_of_day: new Date().toLocaleTimeString(),
      }
      
      console.log('💧 Adding water entry:', waterEntry)
      
      const { error } = await supabase
        .from('water_intake')
        .insert([waterEntry])

      if (error) throw error

      toast.success('Данные сохранены!')
      await fetchSessions()
    } catch (err) {
      console.error('Error adding water:', err)
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
    addWater,
    refresh: fetchSessions
  }
} 