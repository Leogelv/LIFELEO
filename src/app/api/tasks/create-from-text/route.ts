import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

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
    const { text, telegram_id } = await request.json()

    if (!text || !telegram_id) {
      return new NextResponse('Missing required fields', { status: 400 })
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
      return new NextResponse('Failed to analyze task', { status: 500 })
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
      return new NextResponse('Failed to create task', { status: 500 })
    }

    return NextResponse.json({
      success: true,
      task: data[0],
      message: 'Task created successfully'
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 