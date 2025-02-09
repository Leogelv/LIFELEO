import { createClient } from '@supabase/supabase-js'
import { Telegraf } from 'telegraf'

const TELEGRAM_BOT_TOKEN = '7489530714:AAGG_7qGCNGvCMISvw-f5IsAOcRQTriLWCk'
const USER_ID = 375634162

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const bot = new Telegraf(TELEGRAM_BOT_TOKEN)

async function sendNotifications() {
  try {
    // Получаем текущее время в формате HH:mm:ss
    const now = new Date()
    const currentTime = now.toTimeString().split(' ')[0]

    // Получаем активные уведомления для текущего времени
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('active', true)
      .eq('time', currentTime)

    if (error) throw error

    // Отправляем каждое уведомление
    for (const notification of notifications || []) {
      await bot.telegram.sendMessage(USER_ID, notification.message, {
        parse_mode: 'HTML'
      })
      
      console.log(`Sent notification: ${notification.message}`)
    }

  } catch (error) {
    console.error('Error sending notifications:', error)
  }
}

// Запускаем проверку каждую минуту
setInterval(sendNotifications, 60 * 1000)

// Первый запуск
sendNotifications() 