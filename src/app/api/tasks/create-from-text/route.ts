import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Проверка наличия параметров Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!supabaseConfigured) {
  console.warn('⚠️ Supabase URL or Anon Key is not set - database functionality will be unavailable');
  console.log('Debug: NEXT_PUBLIC_SUPABASE_URL =', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Debug: NEXT_PUBLIC_SUPABASE_ANON_KEY exists =', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Создаем клиент только если есть URL и ключ
let supabase = null;
try {
  if (supabaseConfigured) {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    console.log('✅ Supabase client created successfully');
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
  supabase = null;
}

// Проверка DEEPSEEK_API_KEY
const deepseekApiKeyExists = !!process.env.DEEPSEEK_API_KEY;
if (!deepseekApiKeyExists) {
  console.warn('⚠️ DEEPSEEK_API_KEY is not set - task creation from text functionality will be unavailable')
}

// Создаем клиент только если ключ API существует
const client = deepseekApiKeyExists ? new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: false
}) : null;

const systemPrompt = `
Проанализируй текст пользователя и создай задачу в следующем JSON формате:

{
  "task": {
    "name": "Название задачи (короткое и ясное)",
    "deadline": "Дедлайн в формате ISO (YYYY-MM-DDTHH:MM:SS.sssZ)",
    "category": "Категория задачи (work, home, finance, sport, meditation, breathing, water или другая)",
    "notes": "Дополнительные заметки и детали",
    "tags": ["тег1", "тег2"]
  }
}

Правила:
1. Если в тексте не указан дедлайн, установи его на сегодня в 23:59
2. Если в тексте указано время без даты, используй сегодняшнюю дату
3. Если в тексте указана дата без времени, используй 23:59 как время
4. Определи наиболее подходящую категорию из списка
5. Извлеки ключевые теги (не более 3)
6. Сохрани важные детали в поле notes
`

export async function POST(request: Request) {
  try {
    // Проверяем наличие Supabase
    if (!supabaseConfigured || !supabase) {
      return NextResponse.json({ 
        error: 'Supabase is not configured',
        details: 'The Supabase URL and Anonymous Key are required but not set in the environment variables.'
      }, { 
        status: 503 // Service Unavailable
      })
    }

    // Проверяем наличие DEEPSEEK_API_KEY
    if (!deepseekApiKeyExists || !client) {
      return NextResponse.json({ 
        error: 'DEEPSEEK_API_KEY is not configured',
        details: 'The DeepSeek API key is required for task creation from text but is not set in the environment variables.'
      }, { 
        status: 503 // Service Unavailable
      })
    }

    const { text, telegram_id } = await request.json()

    if (!text || !telegram_id) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'Both text and telegram_id are required'
      }, { status: 400 })
    }

    // Анализируем текст с помощью DeepSeek
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' }
    })

    const analysis = completion.choices[0].message.content 
      ? JSON.parse(completion.choices[0].message.content)
      : null

    if (!analysis || !analysis.task) {
      return NextResponse.json({
        error: 'Failed to analyze task',
        details: 'The API did not return valid task data'
      }, { status: 500 })
    }

    // Создаем задачу в базе данных
    const { data, error } = await supabase
      .from('todos')
      .insert({
        name: analysis.task.name,
        deadline: analysis.task.deadline,
        telegram_id: telegram_id,
        done: false,
        notes: analysis.task.notes,
        category: analysis.task.category,
        tags: analysis.task.tags,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({
        error: 'Failed to create task',
        details: error.message || 'Unknown database error'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      task: data[0],
      message: 'Task created successfully'
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 