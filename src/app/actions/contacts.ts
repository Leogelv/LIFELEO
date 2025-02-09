'use server'

import { logger } from '@/utils/logger'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

type TelegramChat = {
  chat_id: number
  title: string
  username: string | null
  last_message: string | null
  chat_type: string
  members_count: number
  is_pinned: boolean
  unread_count: number
  last_message_date?: string
}

type TelegramResponse = {
  success: boolean
  private_chats: TelegramChat[]
  group_chats: TelegramChat[]
  private_chats_count: number
  group_chats_count: number
}

export async function testUpsertContact(chat: TelegramChat) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  console.log('🧪 Тестируем upsert для чата:', chat)

  try {
    // Метод 1: onConflict с user_id
    const result1 = await supabase
      .from('contacts_userbot_leo')
      .upsert({
        user_id: chat.chat_id,
        first_name: chat.title || 'Test Chat',
        last_name: '',
        username: chat.username || '',
        last_message: chat.last_message || '',
        is_pinned: chat.is_pinned || false,
        is_group: true,
        members_count: chat.members_count || 0,
        unread_count: chat.unread_count || 0,
        last_message_date: chat.last_message_date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    console.log('📝 Результат метода 1:', result1)

    // Метод 2: onConflict с ignoreDuplicates
    const result2 = await supabase
      .from('contacts_userbot_leo')
      .upsert({
        user_id: chat.chat_id,
        first_name: chat.title || 'Test Chat',
        last_name: '',
        username: chat.username || '',
        last_message: chat.last_message || '',
        is_pinned: chat.is_pinned || false,
        is_group: true,
        members_count: chat.members_count || 0,
        unread_count: chat.unread_count || 0,
        last_message_date: chat.last_message_date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: true
      })
    
    console.log('📝 Результат метода 2:', result2)

    // Метод 3: update если существует, insert если нет
    const { data: existingContact } = await supabase
      .from('contacts_userbot_leo')
      .select('id, user_id')
      .eq('user_id', chat.chat_id)
      .single()

    let result3
    if (existingContact) {
      result3 = await supabase
        .from('contacts_userbot_leo')
        .update({
          first_name: chat.title || 'Test Chat',
          last_name: '',
          username: chat.username || '',
          last_message: chat.last_message || '',
          is_pinned: chat.is_pinned || false,
          is_group: true,
          members_count: chat.members_count || 0,
          unread_count: chat.unread_count || 0,
          last_message_date: chat.last_message_date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', chat.chat_id)
    } else {
      result3 = await supabase
        .from('contacts_userbot_leo')
        .insert({
          user_id: chat.chat_id,
          first_name: chat.title || 'Test Chat',
          last_name: '',
          username: chat.username || '',
          last_message: chat.last_message || '',
          is_pinned: chat.is_pinned || false,
          is_group: true,
          members_count: chat.members_count || 0,
          unread_count: chat.unread_count || 0,
          last_message_date: chat.last_message_date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }
    
    console.log('📝 Результат метода 3:', result3)

    return {
      method1: result1,
      method2: result2,
      method3: result3
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании upsert:', error)
    throw error
  }
}

export async function getContacts() {
  try {
    logger.debug('🚀 Отправляем запрос к Яндексу...')
    const response = await fetch('https://functions.yandexcloud.net/d4e2knenkei4if251h2i', {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    })

    const responseText = await response.text()
    console.log('📥 Сырой ответ от Яндекса:', responseText)
    logger.debug('📥 Сырой ответ от Яндекса:', responseText)

    if (!response.ok) {
      throw new Error(`Ошибка от Яндекса: ${response.status} ${response.statusText}`)
    }

    let data: TelegramResponse
    try {
      data = JSON.parse(responseText)
      console.log('📦 Распарсили данные:', data)
      logger.debug('📦 Распарсили данные:', data)
      return data
    } catch (e) {
      logger.error('❌ Ошибка парсинга JSON:', responseText)
      throw new Error('Не удалось распарсить ответ от Яндекса')
    }

  } catch (error) {
    logger.error('❌ Критическая ошибка:', error)
    throw error
  }
} 