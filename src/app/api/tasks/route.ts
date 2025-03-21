import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  console.warn('⚠️ DEEPSEEK_API_KEY is not set - tasks analysis functionality will be unavailable')
}

// Создаем клиент только если ключ API существует
const client = deepseekApiKeyExists ? new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: false
}) : null;

const systemPrompt = `
Проанализируй историю сообщений пользователя и создай структурированный список задач в следующем JSON формате:

{
  "tasks": [
    {
      "title": "Название задачи",
      "priority": "Приоритет (high/medium/low)",
      "category": "Категория задачи",
      "deadline": "Предполагаемый дедлайн",
      "context": "Контекст из сообщений",
      "notes": "Дополнительные заметки"
    }
  ],
  "summary": {
    "totalTasks": "Общее количество задач",
    "highPriority": "Количество высокоприоритетных задач",
    "categories": ["Список категорий"],
    "recommendations": ["Рекомендации по выполнению"]
  }
}

Обрати особое внимание на:
1. Четкое выделение конкретных задач
2. Правильную расстановку приоритетов
3. Контекстную информацию
4. Реалистичные сроки
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
        details: 'The DeepSeek API key is required for task analysis but is not set in the environment variables.'
      }, { 
        status: 503 // Service Unavailable
      })
    }

    const { telegram_id } = await request.json()

    // Получаем историю сообщений из Supabase
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('telegram_id', telegram_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(messages) }
      ],
      response_format: { type: 'json_object' }
    })

    const analysis = completion.choices[0].message.content 
      ? JSON.parse(completion.choices[0].message.content)
      : null

    if (!analysis) {
      return NextResponse.json({
        error: 'Failed to analyze tasks',
        details: 'The API did not return valid analysis data'
      }, { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing tasks:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 