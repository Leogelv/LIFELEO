'use client'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private static instance: Logger
  private logs: string[] = []
  private maxLogs: number = 1000
  private isClient: boolean = false

  private constructor() {
    this.isClient = typeof window !== 'undefined'
    
    // Очищаем старые логи при старте, только на клиенте
    if (this.isClient) {
      try {
        localStorage.removeItem('app_logs')
      } catch (e) {
        console.error('Failed to clear logs:', e)
      }
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`
  }

  private saveLogs() {
    // Сохраняем логи только на клиенте
    if (!this.isClient) return
    
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs))
    } catch (e) {
      console.error('Failed to save logs:', e)
    }
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const formattedMessage = this.formatMessage(level, message, data)
    
    // Добавляем в массив
    this.logs.push(formattedMessage)
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    // Сохраняем в localStorage
    this.saveLogs()
    
    // Выводим в консоль только на клиенте
    if (this.isClient) {
      switch (level) {
        case 'error':
          console.error(formattedMessage)
          break
        case 'warn':
          console.warn(formattedMessage)
          break
        case 'debug':
          console.debug(formattedMessage)
          break
        default:
          console.log(formattedMessage)
      }
    }
  }

  public info(message: string, data?: any) {
    this.addLog('info', message, data)
  }

  public warn(message: string, data?: any) {
    this.addLog('warn', message, data)
  }

  public error(message: string, data?: any) {
    this.addLog('error', message, data)
  }

  public debug(message: string, data?: any) {
    this.addLog('debug', message, data)
  }

  public getLogs(): string[] {
    return this.logs
  }

  public clearLogs() {
    this.logs = []
    this.saveLogs()
  }
}

export const logger = Logger.getInstance() 