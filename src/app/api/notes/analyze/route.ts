import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NoteCategory, NoteAnalysis } from '@/app/types/note'

// Уменьшаем таймаут до 60 секунд (лимит Vercel)
export const maxDuration = 60;

// Заголовки CORS для кросс-доменных запросов
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Обработка CORS preflight запросов
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY is not set')
  throw new Error('DEEPSEEK_API_KEY is not set in environment variables')
}

export async function POST(request: Request) {
  try {
    // Добавляем CORS заголовки
    const headers = new Headers(corsHeaders)
    headers.set('Content-Type', 'application/json')

    // Получаем данные из запроса
    const { note_id } = await request.json()

    if (!note_id) {
      return NextResponse.json(
        { error: 'Отсутствует ID заметки' },
        { status: 400, headers }
      )
    }

    // Получаем заметку из базы данных
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', note_id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Заметка не найдена' },
        { status: 404, headers }
      )
    }

    // Формируем запрос к DeepSeek API
    const deepseekPrompt = `
    Проанализируй следующую заметку и предоставь структурированный анализ:
    
    Заголовок: ${note.title}
    Содержание: ${note.content}
    
    Твоя задача:
    1. Создай краткое резюме заметки (1-2 предложения)
    2. Предложи 3-5 релевантных тегов
    3. Оцени важность заметки по шкале от 1 до 10
    4. Оцени срочность заметки по шкале от 1 до 10
    5. Определи наиболее подходящую категорию (work, personal, ideas, learning, health, general)
    6. Выдели 3-5 ключевых моментов из заметки
    7. Предложи 2-3 возможных действия на основе заметки
    8. Предложи 1-2 связанные темы для будущих заметок
    
    Верни результат в формате JSON со следующими полями:
    {
      "summary": "краткое резюме",
      "tags": ["тег1", "тег2", "тег3"],
      "importance": число от 1 до 10,
      "urgency": число от 1 до 10,
      "category": "одна из категорий: work, personal, ideas, learning, health, general",
      "key_points": ["пункт1", "пункт2", "пункт3"],
      "action_items": ["действие1", "действие2"],
      "related_topics": ["тема1", "тема2"]
    }
    `

    // Вызываем DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Ты аналитический помощник, который анализирует заметки и предоставляет структурированный анализ в формате JSON.'
          },
          {
            role: 'user',
            content: deepseekPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    })

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json()
      console.error('Ошибка DeepSeek API:', errorData)
      return NextResponse.json(
        { error: 'Ошибка при анализе заметки' },
        { status: 500, headers }
      )
    }

    const deepseekData = await deepseekResponse.json()
    
    // Извлекаем JSON из ответа DeepSeek
    const responseContent = deepseekData.choices[0].message.content
    let analysis: NoteAnalysis
    
    try {
      // Извлекаем JSON из текстового ответа
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON не найден в ответе')
      }
      
      // Проверяем и корректируем поля анализа
      analysis.importance = Math.min(10, Math.max(1, analysis.importance))
      analysis.urgency = Math.min(10, Math.max(1, analysis.urgency))
      
      // Проверяем категорию
      const validCategories: NoteCategory[] = ['work', 'personal', 'ideas', 'learning', 'health', 'general']
      if (!validCategories.includes(analysis.category as NoteCategory)) {
        analysis.category = 'general'
      }
      
      // Обновляем заметку с результатами анализа
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          is_analyzed: true,
          analysis: analysis,
          tags: analysis.tags,
          importance: analysis.importance,
          urgency: analysis.urgency,
          category: analysis.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', note_id)
      
      if (updateError) {
        console.error('Ошибка при обновлении заметки:', updateError)
        return NextResponse.json(
          { error: 'Ошибка при сохранении анализа' },
          { status: 500, headers }
        )
      }
      
      return NextResponse.json({ analysis }, { headers })
    } catch (error) {
      console.error('Ошибка при обработке ответа DeepSeek:', error, responseContent)
      return NextResponse.json(
        { error: 'Ошибка при обработке анализа' },
        { status: 500, headers }
      )
    }
  } catch (error) {
    console.error('Неожиданная ошибка:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    )
  }
} 