import { NextResponse } from 'next/server'

// Проверка YANDEX_API_KEY
const yandexApiKeyExists = !!process.env.YANDEX_API_KEY;
if (!yandexApiKeyExists) {
  console.warn('⚠️ YANDEX_API_KEY is not set - contacts API might be unavailable')
}

export async function GET() {
  try {
    // Проверяем наличие ключа API перед запросом
    if (!yandexApiKeyExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'YANDEX_API_KEY is not configured',
          message: 'The Yandex API key is required for contacts API but is not set in the environment variables.'
        },
        { status: 503 } // Service Unavailable
      )
    }

    const response = await fetch('https://functions.yandexcloud.net/d4e2knenkei4if251h2i', {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Ошибка от Яндекса: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
} 