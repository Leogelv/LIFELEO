import { supabase } from './supabase/client'
import { logger } from './logger'

// Проверяем наличие необходимых переменных окружения
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  logger.error('❌ Отсутствуют необходимые переменные окружения для Supabase')
  process.exit(1)
}

logger.info('🚀 Запускаем тестовый воркер для habit_logs...', {
  domain: process.env.RAILWAY_PUBLIC_DOMAIN,
  environment: process.env.RAILWAY_ENVIRONMENT_NAME
})

try {
  const channel = supabase.channel('test-logs-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'habit_logs' },
      (payload) => {
        logger.info('📝 LOGS UPDATE:', payload)
      }
    )
    .subscribe((status) => {
      logger.info('🔌 LOGS CHANNEL STATUS:', status)
    })

  // Обработка сигналов завершения
  process.on('SIGINT', () => {
    logger.info('👋 Получен сигнал завершения, отключаемся...')
    channel.unsubscribe()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    logger.info('👋 Получен сигнал завершения, отключаемся...')
    channel.unsubscribe()
    process.exit(0)
  })

  // Держим процесс активным
  setInterval(() => {
    logger.debug('💓 Worker heartbeat')
  }, 60000) // Каждую минуту

} catch (error) {
  logger.error('❌ Ошибка при запуске воркера:', error)
  process.exit(1)
} 