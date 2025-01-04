import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Создаем один инстанс клиента для всего приложения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Отключаем сохранение сессии, так как используем Telegram
  }
})

// Для обратной совместимости
export const createClient = () => supabase 