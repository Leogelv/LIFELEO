import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: false
})

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
      return new NextResponse('Failed to analyze history', { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing history:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 