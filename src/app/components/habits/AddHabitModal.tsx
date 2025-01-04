'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'sport' | 'water' | 'sleep'
  withDateTime?: boolean
  onSuccess?: () => void
}

export function AddHabitModal({ isOpen, onClose, mode, withDateTime = false, onSuccess }: AddHabitModalProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState(format(new Date(), 'HH:mm'))
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [amount, setAmount] = useState('')
  const [quality, setQuality] = useState<1|2|3|4|5>(4)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const telegram_id = 375634162 // TODO: Получать из контекста

      let data = {}
      let table = ''

      switch (mode) {
        case 'sport':
          data = {
            telegram_id,
            date: withDateTime ? date : format(new Date(), 'yyyy-MM-dd'),
            exercise_type: 'general',
            duration: Number(duration),
            intensity,
            notes: withDateTime ? notes : undefined
          }
          table = 'sport_sessions'
          break

        case 'water':
          data = {
            telegram_id,
            date: withDateTime ? date : format(new Date(), 'yyyy-MM-dd'),
            amount: Number(amount),
            time_of_day: withDateTime ? time : format(new Date(), 'HH:mm'),
            notes: withDateTime ? notes : undefined
          }
          table = 'water_intake'
          break

        case 'sleep':
          // Для сна нам нужно рассчитать sleep_end на основе текущего времени
          const now = new Date()
          const sleepStart = withDateTime 
            ? new Date(`${date}T${time}`) 
            : new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 8) // По умолчанию 8 часов назад

          data = {
            telegram_id,
            date: format(sleepStart, 'yyyy-MM-dd'),
            sleep_start: sleepStart.toISOString(),
            sleep_end: now.toISOString(),
            quality,
            notes: withDateTime ? notes : undefined
          }
          table = 'sleep_tracking'
          break
      }

      const { error } = await supabase
        .from(table)
        .insert(data)

      if (error) throw error

      toast.success('Запись успешно добавлена!')
      onSuccess?.()
      onClose()

    } catch (error) {
      console.error('Error saving record:', error)
      toast.error('Ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-[#1A1A1A] rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-xl font-medium text-[#E8D9C5]">
              {mode === 'sport' ? 'Добавить тренировку' :
               mode === 'water' ? 'Добавить питье воды' :
               'Добавить сон'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {withDateTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#E8D9C5]/60 mb-1">Дата</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#E8D9C5]/60 mb-1">Время</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5]"
                    />
                  </div>
                </div>
              )}

              {mode === 'sport' && (
                <>
                  <div>
                    <label className="block text-sm text-[#E8D9C5]/60 mb-1">Длительность (мин)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5]"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#E8D9C5]/60 mb-1">Интенсивность</label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5]"
                    >
                      <option value="low">Низкая</option>
                      <option value="medium">Средняя</option>
                      <option value="high">Высокая</option>
                    </select>
                  </div>
                </>
              )}

              {mode === 'water' && (
                <div>
                  <label className="block text-sm text-[#E8D9C5]/60 mb-1">Количество (мл)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5]"
                    placeholder="250"
                  />
                </div>
              )}

              {mode === 'sleep' && (
                <div>
                  <label className="block text-sm text-[#E8D9C5]/60 mb-1">Качество сна</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5]"
                  >
                    <option value="5">Отличный</option>
                    <option value="4">Хороший</option>
                    <option value="3">Средний</option>
                    <option value="2">Плохой</option>
                    <option value="1">Очень плохой</option>
                  </select>
                </div>
              )}

              {withDateTime && (
                <div>
                  <label className="block text-sm text-[#E8D9C5]/60 mb-1">Комментарий</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#2A2A2A] border border-[#333333] text-[#E8D9C5] resize-none"
                    rows={3}
                    placeholder="Опишите ваши впечатления..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#2A2A2A] text-[#E8D9C5]/60 hover:bg-[#333333] transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#E8D9C5]/10 text-[#E8D9C5] hover:bg-[#E8D9C5]/20 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 