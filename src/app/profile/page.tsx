'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useTelegram } from '../hooks/useTelegram'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Profile() {
  const { userId } = useTelegram()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState({
    priorities: '',
    short_term_goals: '',
    long_term_goals: '',
    skills: ''
  })

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('uzerz')
        .select('*')
        .eq('telegram_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile({
          priorities: data.priorities || '',
          short_term_goals: data.short_term_goals || '',
          long_term_goals: data.long_term_goals || '',
          skills: data.skills || ''
        })
      } else {
        // Создаем новую запись если пользователь не найден
        const { error: insertError } = await supabase
          .from('uzerz')
          .insert([{ telegram_id: userId }])
        
        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('uzerz')
        .update(profile)
        .eq('telegram_id', userId)

      if (error) throw error
      
      alert('Профиль успешно сохранен!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Ошибка при сохранении профиля')
    }
  }

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24">
      <h1 className="text-3xl font-light text-[#E8D9C5] mb-8">Мой профиль</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-[#E8D9C5]/80 mb-2">Мои приоритеты</label>
          <textarea
            value={profile.priorities}
            onChange={(e) => setProfile({ ...profile, priorities: e.target.value })}
            className="w-full h-32 bg-[#1A1A1A]/50 border border-[#E8D9C5]/10 rounded-xl p-3 text-[#E8D9C5]"
            placeholder="Опиши свои текущие приоритеты..."
          />
        </div>

        <div>
          <label className="block text-[#E8D9C5]/80 mb-2">Краткосрочные цели</label>
          <textarea
            value={profile.short_term_goals}
            onChange={(e) => setProfile({ ...profile, short_term_goals: e.target.value })}
            className="w-full h-32 bg-[#1A1A1A]/50 border border-[#E8D9C5]/10 rounded-xl p-3 text-[#E8D9C5]"
            placeholder="Опиши свои краткосрочные цели..."
          />
        </div>

        <div>
          <label className="block text-[#E8D9C5]/80 mb-2">Долгосрочные цели</label>
          <textarea
            value={profile.long_term_goals}
            onChange={(e) => setProfile({ ...profile, long_term_goals: e.target.value })}
            className="w-full h-32 bg-[#1A1A1A]/50 border border-[#E8D9C5]/10 rounded-xl p-3 text-[#E8D9C5]"
            placeholder="Опиши свои долгосрочные цели..."
          />
        </div>

        <div>
          <label className="block text-[#E8D9C5]/80 mb-2">Мои навыки</label>
          <textarea
            value={profile.skills}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
            className="w-full h-32 bg-[#1A1A1A]/50 border border-[#E8D9C5]/10 rounded-xl p-3 text-[#E8D9C5]"
            placeholder="Перечисли свои ключевые навыки..."
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 rounded-xl text-[#E8D9C5] font-medium hover:from-purple-500/90 hover:to-blue-500/90 transition-all duration-300"
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  )
} 