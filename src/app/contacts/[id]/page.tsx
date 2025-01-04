'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contact } from '@/types/contacts'
import { useRouter } from 'next/navigation'
import { AnalysisCard } from '@/app/components/analysis/AnalysisCard'
import { MessageHistory } from '@/app/components/analysis/MessageHistory'
import { ParticipantInfo } from '@/app/components/analysis/ParticipantInfo'
import { toast } from 'react-hot-toast'

export default function ContactPage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchContact()
    
    // Подписываемся на обновления
    const channel = supabase
      .channel('contact-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts_userbot_leo',
          filter: `user_id=eq.${params.id}`
        },
        (payload) => {
          console.log('🔄 Contact updated:', payload)
          setContact(current => current ? { ...current, ...payload.new } : null)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  async function fetchContact() {
    try {
      const { data, error } = await supabase
        .from('contacts_userbot_leo')
        .select('*')
        .eq('user_id', params.id)
        .single()

      if (error) {
        console.error('Error fetching contact:', error)
        return
      }

      setContact(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Не удалось загрузить контакт')
    }
  }

  async function analyzeHistory() {
    try {
      setAnalyzing(true)
      
      // Отправляем на анализ через наш новый API роут
      const response = await fetch('/api/contacts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: params.id })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Failed to analyze:', error)
        throw new Error('Failed to analyze')
      }

      const result = await response.json()

      // Обновляем локальное состояние
      setContact(current => current ? {
        ...current,
        history: result.history,
        summary: result.summary
      } : null)

      toast.success('Анализ успешно завершен!')

    } catch (error) {
      console.error('Error:', error)
      toast.error('Не удалось проанализировать историю')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!contact) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header с крутым градиентным бордером */}
      <div className="relative mb-8 p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 
              text-gray-300 hover:text-white transition-all duration-200"
          >
            <span>←</span>
            <span>Назад</span>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
            text-transparent bg-clip-text">
            {contact.first_name} {contact.last_name}
          </h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Анализ диалога */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Анализ диалога</h2>
            <button
              onClick={analyzeHistory}
              disabled={analyzing}
              className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                text-white font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Анализируем...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    <span>Анализировать диалог</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {contact.summary ? (
            <AnalysisCard analysis={contact.summary} />
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-8 border border-gray-700/50 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-lg">
                Нажмите кнопку "Анализировать диалог" чтобы получить анализ переписки
              </p>
            </div>
          )}
        </div>

        {/* История сообщений */}
        <div className="relative">
          <h2 className="text-2xl font-bold text-white mb-6">История сообщений</h2>
          
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            {contact.history?.raw?.messages ? (
              <MessageHistory messages={contact.history.raw.messages} />
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                  bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/30 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">
                  История сообщений появится после анализа диалога
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 