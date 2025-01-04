import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

if (!process.env.YANDEX_API_KEY) {
  console.error('❌ YANDEX_API_KEY is not set')
  throw new Error('YANDEX_API_KEY is not set in environment variables')
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set')
  throw new Error('OPENAI_API_KEY is not set in environment variables')
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

    // 2. Анализируем через OpenAI
    console.log('🧠 Analyzing with OpenAI')
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "system",
            content: "Ты - помощник для анализа диалогов. Проанализируй историю сообщений и составь краткое резюме о характере общения, основных темах и особенностях взаимодействия."
          },
          {
            role: "user",
            content: JSON.stringify(history)
          }
        ]
      })
    })

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text()
      console.error('❌ OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        response: text
      })
      return NextResponse.json({ 
        error: 'Failed to analyze chat history',
        details: `API returned ${openaiResponse.status} ${openaiResponse.statusText}`,
        response: text
      }, { status: openaiResponse.status })
    }

    const analysis = await openaiResponse.json()
    const summary = analysis.choices[0].message.content
    console.log('✅ Got analysis from OpenAI')

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