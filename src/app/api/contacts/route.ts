import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  console.log('📥 Got request:', request.url)

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log('👋 Handling CORS preflight')
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chat_id')
    console.log('🔍 Got chat_id:', chatId)

    if (!chatId) {
      console.error('❌ chat_id is missing')
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }

    console.log('🚀 Fetching from Vercel API')
    
    const vercelUrl = `https://lifeleo-api.vercel.app/api/messages`
    console.log('📡 Vercel URL:', vercelUrl)
    
    const response = await fetch(vercelUrl)

    if (!response.ok) {
      const text = await response.text()
      console.error('❌ Vercel API error:', {
        status: response.status,
        statusText: response.statusText,
        response: text
      })
      return NextResponse.json({ 
        error: 'Failed to fetch chat history',
        details: `API returned ${response.status} ${response.statusText}`,
        response: text
      }, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    }

    const data = await response.json()
    console.log('✅ Got history from Vercel:', data)

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
} 