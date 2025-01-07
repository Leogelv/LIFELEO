import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: false
})

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
      return new NextResponse('Failed to analyze tasks', { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing tasks:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 