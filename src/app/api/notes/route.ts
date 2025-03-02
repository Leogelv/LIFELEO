import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Note } from '@/app/types/note'

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

// Получение всех заметок пользователя
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const telegram_id = url.searchParams.get('telegram_id')

    if (!telegram_id) {
      return NextResponse.json({ error: 'telegram_id обязателен' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('telegram_id', telegram_id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Ошибка при получении заметок:', error)
      return NextResponse.json({ 
        error: 'Не удалось получить заметки',
        details: error.message
      }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error: any) {
    console.error('❌ Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

// Создание новой заметки
export async function POST(request: Request) {
  try {
    const note = await request.json() as Omit<Note, 'id' | 'created_at' | 'updated_at' | 'is_analyzed' | 'analysis'>
    
    if (!note.telegram_id || !note.title || !note.content) {
      return NextResponse.json({ error: 'telegram_id, title и content обязательны' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        telegram_id: note.telegram_id,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        importance: note.importance || 0,
        urgency: note.urgency || 0,
        category: note.category || 'general',
        is_analyzed: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Ошибка при создании заметки:', error)
      return NextResponse.json({ 
        error: 'Не удалось создать заметку',
        details: error.message
      }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error: any) {
    console.error('❌ Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

// Обновление заметки
export async function PUT(request: Request) {
  try {
    const note = await request.json() as Note
    
    if (!note.id) {
      return NextResponse.json({ error: 'id обязателен' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase
      .from('notes')
      .update({
        title: note.title,
        content: note.content,
        tags: note.tags,
        importance: note.importance,
        urgency: note.urgency,
        category: note.category,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Ошибка при обновлении заметки:', error)
      return NextResponse.json({ 
        error: 'Не удалось обновить заметку',
        details: error.message
      }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error: any) {
    console.error('❌ Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

// Удаление заметки
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id обязателен' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Ошибка при удалении заметки:', error)
      return NextResponse.json({ 
        error: 'Не удалось удалить заметку',
        details: error.message
      }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('❌ Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
} 