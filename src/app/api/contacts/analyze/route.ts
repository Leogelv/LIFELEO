import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

if (!process.env.YANDEX_API_KEY) {
  console.error('❌ YANDEX_API_KEY is not set')
  throw new Error('YANDEX_API_KEY is not set in environment variables')
}

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY is not set')
  throw new Error('DEEPSEEK_API_KEY is not set in environment variables')
}

export async function POST(request: Request) {
  console.log('📥 Got analyze request')

  try {
    const { chat_id } = await request.json()
    console.log('🔍 Got chat_id:', chat_id)

    if (!chat_id) {
      console.error('❌ chat_id is missing')
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }

    // 1. Получаем историю из Yandex Cloud
    console.log('🚀 Fetching from Yandex Cloud for chat:', chat_id)
    const yandexUrl = `https://functions.yandexcloud.net/d4em009uqs3tbu0k3ogl?chat_id=${chat_id}`
    const historyResponse = await fetch(yandexUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
        'Content-Type': 'application/json'
      }
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
      }, { status: historyResponse.status })
    }

    const history = await historyResponse.json()
    console.log('✅ Got history from Yandex')

    // 2. Анализируем через DeepSeek
    console.log('🧠 Analyzing with DeepSeek')
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
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
}

Обрати особое внимание на:
1. Роли и интересы участников
2. Психологические аспекты общения
3. Деловой контекст и перспективы
4. Конкретные результаты и планы
5. Рекомендации по улучшению взаимодействия

Отвечай строго на русском языке в указанном JSON формате.`
          },
          {
            role: "user",
            content: JSON.stringify(history)
          }
        ]
      })
    })

    if (!deepseekResponse.ok) {
      const text = await deepseekResponse.text()
      console.error('❌ DeepSeek API error:', {
        status: deepseekResponse.status,
        statusText: deepseekResponse.statusText,
        response: text
      })
      return NextResponse.json({ 
        error: 'Failed to analyze chat history',
        details: `API returned ${deepseekResponse.status} ${deepseekResponse.statusText}`,
        response: text
      }, { status: deepseekResponse.status })
    }

    const analysis = await deepseekResponse.json()
    const summary = analysis.choices[0].message.content
    console.log('✅ Got analysis from DeepSeek')

    // 3. Сохраняем в Supabase
    console.log('💾 Saving to Supabase')
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error: supabaseError } = await supabase
      .from('contacts_userbot_leo')
      .update({ 
        history: {
          raw: history,
          analysis: analysis
        },
        summary: summary
      })
      .eq('user_id', chat_id)

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError)
      return NextResponse.json({ 
        error: 'Failed to save analysis',
        details: supabaseError.message
      }, { status: 500 })
    }

    console.log('✅ Saved to Supabase')

    return NextResponse.json({
      success: true,
      summary,
      history: {
        raw: history,
        analysis
      }
    })

  } catch (error: unknown) {
    console.error('❌ Error in API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to analyze chat history', details: errorMessage }, 
      { status: 500 }
    )
  }
} 