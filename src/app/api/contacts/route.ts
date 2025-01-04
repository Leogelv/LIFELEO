import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

if (!process.env.YANDEX_API_KEY) {
  console.error('❌ YANDEX_API_KEY is not set')
  throw new Error('YANDEX_API_KEY is not set in environment variables')
}

console.log('✅ YANDEX_API_KEY is set:', process.env.YANDEX_API_KEY?.slice(0, 5) + '...')

export async function GET(request: Request) {
  console.log('📥 Got request:', request.url)
  console.log('📱 User Agent:', request.headers.get('user-agent'))
  console.log('🌐 Origin:', request.headers.get('origin'))
  console.log('🔑 Headers:', JSON.stringify(Object.fromEntries([...request.headers]), null, 2))

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log('👋 Handling CORS preflight')
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chat_id')
    console.log('🔍 Got chat_id:', chatId)

    if (!chatId) {
      console.error('❌ chat_id is missing')
      return NextResponse.json({ error: 'chat_id is required' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      })
    }

    console.log('🚀 Fetching from Yandex Cloud for chat:', chatId)
    
    const yandexUrl = `https://functions.yandexcloud.net/d4em009uqs3tbu0k3ogl?chat_id=${chatId}`
    console.log('📡 Yandex URL:', yandexUrl)
    
    const response = await fetch(yandexUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('❌ Yandex API error:', {
        status: response.status,
        statusText: response.statusText,
        response: text,
        headers: JSON.stringify(Object.fromEntries([...response.headers]), null, 2)
      })
      return NextResponse.json({ 
        error: 'Failed to fetch chat history',
        details: `API returned ${response.status} ${response.statusText}`,
        response: text
      }, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        }
      })
    }

    const data = await response.json()
    console.log('✅ Got history from Yandex:', data)

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    })

  } catch (error: unknown) {
    console.error('❌ Error in API route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch chat history', details: errorMessage }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      }
    )
  }
} 