import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Уменьшаем таймаут до 60 секунд (лимит Vercel)
export const maxDuration = 60;

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Обработчик OPTIONS для CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Проверка DEEPSEEK_API_KEY, который обязателен
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY is not set')
  throw new Error('DEEPSEEK_API_KEY is not set in environment variables')
}

// Проверка YANDEX_API_KEY теперь не блокирует сборку
const yandexApiKeyExists = !!process.env.YANDEX_API_KEY;
if (!yandexApiKeyExists) {
  console.warn('⚠️ YANDEX_API_KEY is not set - some features may be unavailable')
}

// Функция для разбивки истории на чанки
function chunkHistory(history: any[], chunkSize: number = 50) {
  const chunks = []
  for (let i = 0; i < history.length; i += chunkSize) {
    chunks.push(history.slice(i, i + chunkSize))
  }
  return chunks
}

// Функция для анализа одного чанка
async function analyzeChunk(chunk: any[]) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    // Увеличиваем таймаут до 2 минут
    signal: AbortSignal.timeout(120000),
    body: JSON.stringify({
      model: "deepseek-chat",
      response_format: {
        type: 'json_object'
      },
      messages: [
        {
          role: "system",
          content: `Проанализируй историю переписки и предоставь детальный анализ в следующем JSON формате:

{
  "summary": "Краткий обзор основных тем и ключевых моментов беседы",
  "topics": ["Массив основных обсуждаемых тем"],
  "sentiment": "Общий тон беседы (positive/neutral/negative)",
  "actionItems": ["Массив упомянутых задач или дел на будущее"],
  "participants": {
    "roles": ["Роли участников беседы"],
    "interests": ["Основные интересы участников"],
    "communicationStyle": ["Стили общения участников (визуал/аудиал/кинестет/дигитал)"]
  },
  "context": {
    "type": "Тип беседы (деловая/личная/смешанная)",
    "mainGoal": "Основная цель обсуждения",
    "technologies": ["Упомянутые технологии/продукты/компании"]
  },
  "psychologicalAspects": {
    "values": ["Ключевые ценности участников"],
    "motivations": ["Мотивационные факторы"],
    "mood": "Общее настроение беседы"
  },
  "businessAnalysis": {
    "strengths": ["Сильные стороны сотрудничества"],
    "risks": ["Потенциальные риски"],
    "recommendations": ["Рекомендации по дальнейшим действиям"]
  },
  "conclusions": {
    "achieved": ["Достигнутые результаты"],
    "pending": ["Нерешенные вопросы"],
    "nextSteps": ["Предлагаемые следующие шаги"]
  }
}`
        },
        {
          role: "user",
          content: JSON.stringify(chunk)
        }
      ],
      temperature: 0.5,
      max_tokens: 2048,
      top_p: 1
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ DeepSeek API error:', {
      status: response.status,
      statusText: response.statusText,
      errorText
    })
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  try {
    // Попытка распарсить JSON из строки
    const content = data.choices[0].message.content
    return JSON.parse(content)
  } catch (error) {
    console.error('❌ Failed to parse DeepSeek response:', error)
    // Возвращаем как есть, если не удалось распарсить
    return data.choices[0].message.content
  }
}

// Объединяет результаты анализа нескольких чанков
function combineAnalyses(analyses: any[]) {
  // Если всего один анализ, просто возвращаем его
  if (analyses.length === 1) return analyses[0]

  // Если все строки - объединяем как текст
  if (analyses.every(a => typeof a === 'string')) {
    return analyses.join('\n\n')
  }

  // Объединяем ключи из всех анализов
  const combined: any = {
    summary: analyses.map(a => a.summary).filter(Boolean).join('\n\n'),
    topics: Array.from(new Set(analyses.flatMap(a => a.topics || []))),
    sentiment: analyses[analyses.length - 1]?.sentiment || 'neutral',
    actionItems: Array.from(new Set(analyses.flatMap(a => a.actionItems || []))),
    participants: {
      roles: Array.from(new Set(analyses.flatMap(a => a.participants?.roles || []))),
      interests: Array.from(new Set(analyses.flatMap(a => a.participants?.interests || []))),
      communicationStyle: Array.from(new Set(analyses.flatMap(a => a.participants?.communicationStyle || [])))
    },
    context: {
      type: analyses[analyses.length - 1]?.context?.type || 'mixed',
      mainGoal: analyses[analyses.length - 1]?.context?.mainGoal || '',
      technologies: Array.from(new Set(analyses.flatMap(a => a.context?.technologies || [])))
    },
    psychologicalAspects: {
      values: Array.from(new Set(analyses.flatMap(a => a.psychologicalAspects?.values || []))),
      motivations: Array.from(new Set(analyses.flatMap(a => a.psychologicalAspects?.motivations || []))),
      mood: analyses[analyses.length - 1]?.psychologicalAspects?.mood || 'neutral'
    },
    businessAnalysis: {
      strengths: Array.from(new Set(analyses.flatMap(a => a.businessAnalysis?.strengths || []))),
      risks: Array.from(new Set(analyses.flatMap(a => a.businessAnalysis?.risks || []))),
      recommendations: Array.from(new Set(analyses.flatMap(a => a.businessAnalysis?.recommendations || [])))
    },
    conclusions: {
      achieved: Array.from(new Set(analyses.flatMap(a => a.conclusions?.achieved || []))),
      pending: Array.from(new Set(analyses.flatMap(a => a.conclusions?.pending || []))),
      nextSteps: Array.from(new Set(analyses.flatMap(a => a.conclusions?.nextSteps || [])))
    }
  }

  return combined
}

export async function POST(request: Request) {
  console.log('📥 Got analyze request')

  try {
    const { chat_id } = await request.json()
    console.log('🔍 Got chat_id:', chat_id)

    if (!chat_id) {
      console.error('❌ chat_id is missing')
      return NextResponse.json({ error: 'chat_id is required' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Проверяем наличие YANDEX_API_KEY перед запросом к API
    if (!yandexApiKeyExists) {
      return NextResponse.json({ 
        error: 'YANDEX_API_KEY is not configured',
        details: 'The Yandex API key is required for this endpoint but is not set in the environment variables.'
      }, { 
        status: 503, // Service Unavailable
        headers: corsHeaders
      })
    }

    // 1. Получаем историю из Yandex Cloud
    console.log('🚀 Fetching from Yandex Cloud for chat:', chat_id)
    const yandexUrl = `https://functions.yandexcloud.net/d4em009uqs3tbu0k3ogl?chat_id=${chat_id}`
    const historyResponse = await fetch(yandexUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(30000)
    })

    if (!historyResponse.ok) {
      const text = await historyResponse.text()
      console.error('❌ Yandex API error:', {
        status: historyResponse.status,
        statusText: historyResponse.statusText,
        response: text
      })
      return NextResponse.json({ 
        error: 'Failed to fetch chat history',
        details: `API returned ${historyResponse.status} ${historyResponse.statusText}`,
        response: text
      }, { 
        status: historyResponse.status,
        headers: corsHeaders
      })
    }

    const history = await historyResponse.json()
    console.log('✅ Got history from Yandex')

    // 2. Разбиваем историю на чанки и анализируем каждый
    console.log('🧠 Analyzing with DeepSeek')
    const chunks = chunkHistory(history.messages || [], 50)
    console.log(`📦 Split history into ${chunks.length} chunks`)

    const analyses = []
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Analyzing chunk ${i + 1}/${chunks.length}`)
      const chunk = chunks[i]
      const analysis = await analyzeChunk(chunk)
      analyses.push(analysis)
    }

    // 3. Объединяем результаты анализа всех чанков
    console.log('🔄 Combining analyses')
    const combinedAnalysis = combineAnalyses(analyses)

    // 4. Сохраняем результат
    console.log('💾 Saving analysis to Supabase')
    
    // Получаем суперклиент
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Создаем или обновляем запись в базе данных
    const { error: dbError } = await supabase
      .from('contact_analyses')
      .upsert({
        contact_id: chat_id,
        analysis: combinedAnalysis,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'contact_id'
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      // Продолжаем выполнение даже при ошибке сохранения
    } else {
      console.log('✅ Analysis saved successfully')
    }

    // 5. Возвращаем результат анализа
    console.log('📤 Returning analysis')
    return NextResponse.json({ 
      success: true,
      analysis: combinedAnalysis
    }, {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ Analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze chat',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
} 