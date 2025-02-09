import { supabase } from './supabase/client'
import { logger } from './logger'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface Habit {
  id: string
  name: string
  category: string
  target_value: number
  telegram_id: number
  created_at: string
  active: boolean
}

interface HabitLog {
  id: string
  habit_id: string
  value: number
  completed_at: string
  created_at: string
}

type RealtimeCallback = (payload: RealtimePostgresChangesPayload<any> & { table: string }) => void

class HabitsRealtimeManager {
  private static instance: HabitsRealtimeManager
  private channel: any
  private callbacks: Map<string, RealtimeCallback[]> = new Map()
  private isConnected: boolean = false
  private reconnectTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.initChannel()
  }

  public static getInstance(): HabitsRealtimeManager {
    if (!HabitsRealtimeManager.instance) {
      HabitsRealtimeManager.instance = new HabitsRealtimeManager()
    }
    return HabitsRealtimeManager.instance
  }

  private initChannel() {
    logger.info('🔄 Инициализация realtime каналов для привычек и логов...')
    
    this.channel = supabase.channel('habits-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits' },
        (payload) => {
          logger.debug('📥 Получено изменение в habits:', {
            event: payload.eventType,
            new: payload.new,
            old: payload.old
          })
          this.handlePayload({ ...payload, table: 'habits' })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_logs' },
        (payload) => {
          logger.debug('📝 Получено изменение в habit_logs:', {
            event: payload.eventType,
            new: payload.new,
            old: payload.old
          })
          this.handlePayload({ ...payload, table: 'habit_logs' })
        }
      )
      .subscribe((status: string) => {
        logger.info('🔌 Статус подключения к realtime:', status)
        
        if (status === 'SUBSCRIBED') {
          this.isConnected = true
          logger.info('✅ Успешно подписались на изменения в habits и habit_logs')
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
          }
        }
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false
          logger.warn('🔄 Соединение закрыто, пробуем переподключиться через 5 секунд...')
          
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnect()
            }, 5000)
          }
        }
      })
  }

  private handlePayload(payload: RealtimePostgresChangesPayload<any> & { table: string }) {
    this.callbacks.forEach((callbacks, key) => {
      callbacks.forEach(callback => {
        try {
          callback(payload)
        } catch (error) {
          logger.error('❌ Ошибка в обработчике realtime:', error)
        }
      })
    })
  }

  private reconnect() {
    logger.info('🔄 Переподключение к realtime...')
    if (this.channel) {
      this.channel.unsubscribe()
    }
    this.initChannel()
  }

  public subscribe(key: string, callback: RealtimeCallback) {
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, [])
    }
    this.callbacks.get(key)?.push(callback)

    if (!this.isConnected) {
      this.reconnect()
    }

    logger.debug('✅ Добавлена подписка на realtime события', { key })
    return () => this.unsubscribe(key, callback)
  }

  private unsubscribe(key: string, callback: RealtimeCallback) {
    const callbacks = this.callbacks.get(key)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
        logger.debug('🔌 Удалена подписка на realtime события', { key })
      }
      if (callbacks.length === 0) {
        this.callbacks.delete(key)
      }
    }
  }

  public cleanup() {
    if (this.channel) {
      logger.debug('🔌 Отключаемся от realtime каналов')
      this.channel.unsubscribe()
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.callbacks.clear()
  }
}

export const habitsRealtime = HabitsRealtimeManager.getInstance() 