import { supabase } from './supabase/client'
import { logger } from './logger'

logger.info('🚀 Запускаем тестовый воркер для habit_logs...')

const channel = supabase.channel('test-logs-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'habit_logs' },
    (payload) => {
      console.log('📝 LOGS UPDATE:', payload)
    }
  )
  .subscribe((status) => {
    console.log('🔌 LOGS CHANNEL STATUS:', status)
  })

// Держим процесс активным
process.on('SIGINT', () => {
  channel.unsubscribe()
  process.exit()
})

setInterval(() => {
  // Пустой интервал чтобы процесс не завершился
}, 1000) 