'use client'

import { useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { logger } from '@/utils/logger'

export function LogsWorker() {
  useEffect(() => {
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

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return null
} 