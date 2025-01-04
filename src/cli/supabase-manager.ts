#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import fetch from 'node-fetch'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const program = new Command()

program
  .name('supabase-manager')
  .description('CLI для управления Supabase базой данных')
  .version('1.0.0')

program
  .command('list-tables')
  .description('Показать все таблицы и количество записей')
  .action(async () => {
    try {
      const realTables = [
        'contacts_userbot_leo',
        'instructions',
        'meditation_courses',
        'meditation_sessions',
        'messages_userbot',
        'msgs',
        'todos',
        'users_shkola',
        'uzerz'
      ]

      console.log('\n📊 Таблицы в базе данных:\n')

      for (const tableName of realTables) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })

          if (error) {
            console.log(`❌ ${tableName}: ${error.message}`)
            continue
          }

          console.log(`📦 ${tableName}: ${count || 0} записей`)
        } catch (err) {
          console.log(`❌ ${tableName}: ошибка доступа`)
        }
      }

    } catch (error) {
      console.error('❌ Ошибка:', error)
    }
  })

// Определяем интерфейс для диалога
interface Dialog {
  chat_id: number;
  name: string;
  username: string | null;
  last_message: string | null;
  unread_count: number;
  unread_mentions_count: number;
  is_unread: boolean;
  is_pinned: boolean;
}

interface ApiResponse {
  success: boolean;
  dialogs_count: number;
  dialogs: Dialog[];
}

program
  .command('import-contacts')
  .description('Импортировать контакты из API в базу данных')
  .option('--table <n>', 'Имя таблицы для импорта', 'contacts_userbot_leo')
  .action(async (options) => {
    try {
      console.log('🔄 Получаем контакты из API...')
      
      // Получаем данные из API с правильным ключом
      const response = await fetch(
        'https://functions.yandexcloud.net/d4e2knenkei4if251h2i',
        {
          headers: {
            'Authorization': 'Api-Key AQVNwPYqs6YHWKQQ77Yi9VZZQPyLsQnOY0xYHhYL'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`API вернул ошибку: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as ApiResponse
      console.log('📝 Получены данные:', JSON.stringify(data, null, 2))

      // Преобразуем диалоги в формат контактов и удаляем дубликаты
      const contactsMap = new Map()
      data.dialogs.forEach(dialog => {
        contactsMap.set(dialog.chat_id, {
          user_id: dialog.chat_id,
          first_name: dialog.name.split(' ')[0],
          last_name: dialog.name.split(' ').slice(1).join(' ') || null,
          username: dialog.username,
          last_message: dialog.last_message,
          is_pinned: dialog.is_pinned,
          unread_count: dialog.unread_count
        })
      })
      const contacts = Array.from(contactsMap.values())

      console.log(`📥 Получено ${contacts.length} уникальных контактов`)
      console.log('🔄 Импортируем в базу данных...')

      // Размер пакета для импорта
      const batchSize = 100

      // Импортируем записи пакетами
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize)
        console.log(`📦 Импортируем записи ${i + 1} - ${Math.min(i + batchSize, contacts.length)}...`)
        
        const { error: importError } = await supabase
          .from(options.table)
          .upsert(
            batch.map(contact => ({
              ...contact,
              updated_at: new Date().toISOString()
            })),
            { 
              onConflict: 'user_id',
              ignoreDuplicates: false
            }
          )

        if (importError) {
          console.error('❌ Ошибка при импорте батча:', importError)
          throw importError
        }
      }

      console.log('✅ Импорт успешно завершен!')
      
      // Проверяем количество записей
      const { count, error: countError } = await supabase
        .from(options.table)
        .select('*', { count: 'exact', head: true })

      if (!countError) {
        console.log(`📊 Всего записей в таблице: ${count}`)
      }

    } catch (error) {
      console.error('❌ Ошибка:', error)
    }
  })

program.parse() 