'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MeditationModal } from './MeditationModal'
import { TodayCard } from './TodayCard'
import { MeditationCalendarGrid } from './MeditationCalendarGrid'
import { MeditationStats } from './MeditationStats'

interface MeditationSession {
  uuid: string
  user_id: string
  date: string
  type: string
  duration: number
  completed: boolean
  created_at: string
}

export function MeditationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [weeklyStats, setWeeklyStats] = useState({ total: 0, sessions: 0 })
  const [monthlyStats, setMonthlyStats] = useState({ total: 0, sessions: 0 })
  const [showModal, setShowModal] = useState(false)
  const [todaySessions, setTodaySessions] = useState<MeditationSession[]>([])
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null)
  
  const supabase = createClient()
  const USER_ID = '375634162' // Хардкодим ID для тестов

  // Восстанавливаем сессию при загрузке
  useEffect(() => {
    const checkExistingSession = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Проверяем незавершенные сессии за сегодня
      const { data: todaySession } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('date', today)
        .eq('completed', false)
        .gt('time_left', 0) // Добавляем проверку на оставшееся время
        .single()

      if (todaySession) {
        setCurrentSession(todaySession)
        setShowModal(true)
      }
    }

    checkExistingSession()
  }, [])

  // Получаем данные за месяц
  const fetchSessions = useCallback(async () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    
    const { data, error } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', USER_ID)
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'))
      .order('date')

    if (error) {
      console.error('Error fetching sessions:', error)
      return
    }

    setSessions(data || [])

    // Получаем сессии за сегодня
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayData = data?.filter(s => s.date === today) || []
    setTodaySessions(todayData)

    // Считаем статистику за неделю и месяц
    calculateStats(data)
  }, [currentDate, supabase])

  const calculateStats = (data: MeditationSession[]) => {
    // Считаем статистику за неделю
    const weekStart = startOfWeek(currentDate, { locale: ru })
    const weekEnd = endOfWeek(currentDate, { locale: ru })
    const weekSessions = data?.filter(s => {
      const date = new Date(s.date)
      return date >= weekStart && date <= weekEnd
    })
    setWeeklyStats({
      total: weekSessions?.reduce((sum, s) => sum + s.duration, 0) || 0,
      sessions: weekSessions?.length || 0
    })

    // Считаем статистику за месяц
    setMonthlyStats({
      total: data?.reduce((sum, s) => sum + s.duration, 0) || 0,
      sessions: data?.length || 0
    })
  }

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const startMeditation = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const type = todaySessions.length === 0 ? 'morning' : 'evening'

    // Проверяем существующую сессию
    const existingSession = todaySessions.find(s => !s.completed)
    if (existingSession) {
      setCurrentSession(existingSession)
      setShowModal(true)
      return
    }

    // Создаем новую сессию
    const { data: newSession, error } = await supabase
      .from('meditation_sessions')
      .insert({
        user_id: USER_ID,
        date: today,
        type,
        duration: 0,
        completed: false,
        time_left: 60 // Добавляем начальное время - 1 час
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return
    }

    setCurrentSession(newSession)
    setShowModal(true)
    await fetchSessions()
  }

  const cancelMeditation = async () => {
    if (currentSession) {
      const { error } = await supabase
        .from('meditation_sessions')
        .delete()
        .eq('uuid', currentSession.uuid)

      if (error) {
        console.error('Error deleting session:', error)
        return
      }

      setCurrentSession(null)
      setShowModal(false)
      await fetchSessions()
    }
  }

  const onComplete = async (duration: number) => {
    if (currentSession) {
      const { error } = await supabase
        .from('meditation_sessions')
        .update({
          duration,
          completed: duration >= 60
        })
        .eq('uuid', currentSession.uuid)

      if (error) {
        console.error('Error updating session:', error)
        return
      }

      if (duration >= 60) {
        setCurrentSession(null)
        setShowModal(false)
      }
      
      await fetchSessions()
    }
  }

  return (
    <div className="space-y-8">
      <TodayCard
        todayStats={{
          morningMinutes: todaySessions.filter(s => s.type === 'morning').reduce((sum, s) => sum + s.duration, 0),
          eveningMinutes: todaySessions.filter(s => s.type === 'evening').reduce((sum, s) => sum + s.duration, 0),
          totalMinutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
          sessionsCount: todaySessions.length
        }}
        onStartMeditation={startMeditation}
      />

      <MeditationCalendarGrid
        currentDate={currentDate}
        sessions={sessions}
      />

      <MeditationStats
        weeklyStats={weeklyStats}
        monthlyStats={monthlyStats}
      />

      <MeditationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setCurrentSession(null)
        }}
        onComplete={onComplete}
        onCancel={cancelMeditation}
        session={currentSession}
      />
    </div>
  )
} 