import { supabase } from './supabase/client'
import { logger } from './logger'

type RealtimeCallback = (payload: any) => void

class RealtimeManager {
  private static instance: RealtimeManager
  private channel: any
  private callbacks: Map<string, RealtimeCallback[]> = new Map()
  private isConnected: boolean = false
  private reconnectTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.initChannel()
  }

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  private initChannel() {
    logger.info('🔄 Инициализация realtime канала...')
    
    this.channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => this.handlePayload(payload)
      )
      .subscribe((status: string) => {
        logger.info('🔌 Статус подключения к realtime:', status)
        
        if (status === 'SUBSCRIBED') {
          this.isConnected = true
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
          }
        }
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false
          logger.warn('🔄 Соединение закрыто, пробуем переподключиться через 5 секунд...')
          
          // Переподключаемся не сразу, а с задержкой
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnect()
            }, 5000)
          }
        }
      })
  }

  private handlePayload(payload: any) {
    this.callbacks.forEach((callbacks, key) => {
      callbacks.forEach(callback => {
        try {
          callback(payload)
        } catch (error) {
          logger.error('Ошибка в обработчике realtime:', error)
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

    // Если канал отключен, пробуем переподключиться
    if (!this.isConnected) {
      this.reconnect()
    }

    return () => this.unsubscribe(key, callback)
  }

  private unsubscribe(key: string, callback: RealtimeCallback) {
    const callbacks = this.callbacks.get(key)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        this.callbacks.delete(key)
      }
    }
  }

  public cleanup() {
    if (this.channel) {
      logger.debug('🔌 Отключаемся от realtime канала')
      this.channel.unsubscribe()
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.callbacks.clear()
  }
}

export const realtime = RealtimeManager.getInstance() 