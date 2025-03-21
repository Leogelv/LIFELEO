import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

// Проверка DEEPSEEK_API_KEY
const deepseekApiKeyExists = !!process.env.DEEPSEEK_API_KEY;
if (!deepseekApiKeyExists) {
  console.warn('⚠️ DEEPSEEK_API_KEY is not set - analyze functionality will be unavailable')
}

// Создаем клиент только если ключ API существует
const client = deepseekApiKeyExists ? new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: false
}) : null;

const systemPrompt = `
Проанализируй историю переписки и предоставь детальный анализ в следующем JSON формате:

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
}

Обрати особое внимание на:
1. Роли и интересы участников
2. Психологические аспекты общения
3. Деловой контекст и перспективы
4. Конкретные результаты и планы
5. Рекомендации по улучшению взаимодействия

Отвечай строго на русском языке в указанном JSON формате.
`

export async function POST(request: Request) {
  try {
    // Проверяем наличие DEEPSEEK_API_KEY
    if (!deepseekApiKeyExists || !client) {
      return NextResponse.json({ 
        error: 'DEEPSEEK_API_KEY is not configured',
        details: 'The DeepSeek API key is required for this endpoint but is not set in the environment variables.'
      }, { 
        status: 503 // Service Unavailable
      })
    }

    const { history } = await request.json()

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(history) }
      ],
      response_format: { type: 'json_object' }
    })

    const analysis = completion.choices[0].message.content 
      ? JSON.parse(completion.choices[0].message.content)
      : null

    if (!analysis) {
      return NextResponse.json({
        error: 'Failed to analyze history',
        details: 'The API did not return valid analysis data'
      }, { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing history:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 