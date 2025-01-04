import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' }, 
      { status: 500 }
    )
  }
} 