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

// Обработка CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

if (!process.env.YANDEX_API_KEY) {
  console.error('❌ YANDEX_API_KEY is not set')
  throw new Error('YANDEX_API_KEY is not set in environment variables')
}

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY is not set')
  throw new Error('DEEPSEEK_API_KEY is not set in environment variables')
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
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  return JSON.parse(result.choices[0].message.content)
}

// Функция для объединения результатов анализа чанков
function mergeAnalysis(analyses: any[]) {
  if (analyses.length === 0) return null
  if (analyses.length === 1) return analyses[0]

  const merged = JSON.parse(JSON.stringify(analyses[0])) // Глубокое клонирование первого анализа

  // Объединяем массивы из всех анализов
  for (let i = 1; i < analyses.length; i++) {
    const analysis = analyses[i]
    merged.topics = Array.from(new Set([...merged.topics, ...analysis.topics]))
    merged.actionItems = Array.from(new Set([...merged.actionItems, ...analysis.actionItems]))
    merged.participants.roles = Array.from(new Set([...merged.participants.roles, ...analysis.participants.roles]))
    merged.participants.interests = Array.from(new Set([...merged.participants.interests, ...analysis.participants.interests]))
    merged.participants.communicationStyle = Array.from(new Set([...merged.participants.communicationStyle, ...analysis.participants.communicationStyle]))
    merged.context.technologies = Array.from(new Set([...merged.context.technologies, ...analysis.context.technologies]))
    merged.psychologicalAspects.values = Array.from(new Set([...merged.psychologicalAspects.values, ...analysis.psychologicalAspects.values]))
    merged.psychologicalAspects.motivations = Array.from(new Set([...merged.psychologicalAspects.motivations, ...analysis.psychologicalAspects.motivations]))
    merged.businessAnalysis.strengths = Array.from(new Set([...merged.businessAnalysis.strengths, ...analysis.businessAnalysis.strengths]))
    merged.businessAnalysis.risks = Array.from(new Set([...merged.businessAnalysis.risks, ...analysis.businessAnalysis.risks]))
    merged.businessAnalysis.recommendations = Array.from(new Set([...merged.businessAnalysis.recommendations, ...analysis.businessAnalysis.recommendations]))
    merged.conclusions.achieved = Array.from(new Set([...merged.conclusions.achieved, ...analysis.conclusions.achieved]))
    merged.conclusions.pending = Array.from(new Set([...merged.conclusions.pending, ...analysis.conclusions.pending]))
    merged.conclusions.nextSteps = Array.from(new Set([...merged.conclusions.nextSteps, ...analysis.conclusions.nextSteps]))
  }

  // Обновляем summary, объединяя все саммари
  merged.summary = analyses.map(a => a.summary).join(' ')

  // Определяем общий sentiment на основе всех анализов
  const sentiments = analyses.map(a => a.sentiment)
  const sentimentCounts = {
    positive: sentiments.filter(s => s === 'positive').length,
    neutral: sentiments.filter(s => s === 'neutral').length,
    negative: sentiments.filter(s => s === 'negative').length
  }
  
  // Находим sentiment с максимальным количеством
  let maxCount = 0
  let dominantSentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  
  Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantSentiment = sentiment as 'positive' | 'neutral' | 'negative'
    }
  })
  
  merged.sentiment = dominantSentiment

  return merged
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
      try {
        const analysis = await analyzeChunk(chunks[i])
        analyses.push(analysis)
      } catch (error) {
        console.error(`❌ Error analyzing chunk ${i + 1}:`, error)
        // Продолжаем с следующим чанком
      }
    }

    if (analyses.length === 0) {
      throw new Error('Failed to analyze any chunks')
    }

    // 3. Объединяем результаты анализа
    console.log('🔄 Merging analyses')
    const mergedAnalysis = mergeAnalysis(analyses)

    // 4. Сохраняем в Supabase
    console.log('💾 Saving to Supabase')
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error: supabaseError } = await supabase
      .from('contacts_userbot_leo')
      .update({ 
        history: {
          raw: history,
          analysis: mergedAnalysis
        },
        summary: mergedAnalysis
      })
      .eq('user_id', chat_id)

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError)
      return NextResponse.json({ 
        error: 'Failed to save analysis',
        details: supabaseError.message
      }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    console.log('✅ Saved to Supabase')

    return NextResponse.json({
      success: true,
      summary: mergedAnalysis,
      history: {
        raw: history,
        analysis: mergedAnalysis
      }
    }, {
      headers: corsHeaders
    })

  } catch (error: unknown) {
    console.error('❌ Error in API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to analyze chat history', details: errorMessage }, 
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
} 