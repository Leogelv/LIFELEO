const { createClient } = require('@supabase/supabase-js')

// Создаем клиента Supabase
const supabase = createClient(
  'https://supashkola.ru',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM0ODExMjAwLAogICJleHAiOiAxODkyNTc3NjAwCn0.CkO2sAnfGPgtTGHckFJhoF5_LnmecwWdigoC-N43ooI'
)

// Функция для работы с тасками и хэбитами
async function processRealtime() {
  try {
    console.log('🔄 Подключаемся к базе данных...')
    
    // Создаем канал для тасков (is_habit = false)
    const tasksChannel = supabase.channel('tasks-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos',
          filter: 'is_habit=eq.false'
        },
        (payload) => {
          console.log('🎯 Изменение в тасках:', {
            event: payload.eventType,
            task: payload.new?.name || payload.old?.name,
            id: payload.new?.id || payload.old?.id
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Статус канала тасков:', status)
      })

    // Создаем канал для хэбитов (is_habit = true)
    const habitsChannel = supabase.channel('habits-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos',
          filter: 'is_habit=eq.true'
        },
        (payload) => {
          console.log('💪 Изменение в хэбитах:', {
            event: payload.eventType,
            habit: payload.new?.name || payload.old?.name,
            id: payload.new?.id || payload.old?.id
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Статус канала хэбитов:', status)
      })

    // Создаем канал для логов хэбитов
    const habitLogsChannel = supabase.channel('habit-logs-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'habit_logs'
        },
        (payload) => {
          console.log('📝 Изменение в логах хэбитов:', {
            event: payload.eventType,
            habitId: payload.new?.habit_id || payload.old?.habit_id,
            value: payload.new?.value
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Статус канала логов:', status)
      })

    // Держим процесс активным и корректно закрываем при выходе
    process.on('SIGINT', () => {
      console.log('👋 Отключаемся от базы данных...')
      tasksChannel.unsubscribe()
      habitsChannel.unsubscribe()
      habitLogsChannel.unsubscribe()
      process.exit()
    })

  } catch (error) {
    console.error('❌ Ошибка:', error)
  }
}

// Запускаем обработку
console.log('🚀 Запускаем воркер для тасков и хэбитов...')
processRealtime() 