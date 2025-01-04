import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

if (!process.env.YANDEX_API_KEY) {
  throw new Error('YANDEX_API_KEY is not set in environment variables')
}

export async function GET(request: Request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chat_id')

  if (!chatId) {
    return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
  }

  try {
    console.log('🔍 Fetching history for chat:', chatId)
    
    const response = await fetch(
      `https://functions.yandexcloud.net/d4em009uqs3tbu0k3ogl?chat_id=${chatId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('❌ API error:', response.status, response.statusText)
      const text = await response.text()
      console.error('Response:', text)
      throw new Error(`API returned ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Got history:', data)

    // Add CORS headers to the response
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })

  } catch (error) {
    console.error('❌ Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
} 