'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contact } from '@/types/contacts'
import { useRouter } from 'next/navigation'
import { AnalysisCard } from '@/app/components/analysis/AnalysisCard'
import { MessageHistory } from '@/app/components/analysis/MessageHistory'
import { ParticipantInfo } from '@/app/components/analysis/ParticipantInfo'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, MessageSquare, User } from 'lucide-react'

export default function ContactPage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
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

  const analyzeHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/contacts?chat_id=${contact.user_id}`)
      const text = await response.text()
      
      console.log('Response:', {
        status: response.status,
        text: text
      })
      
      if (!response.ok) {
        setError(`Error ${response.status}: ${text}`)
        return
      }
      
      const data = JSON.parse(text)
      if (!data.success) {
        setError(`API Error: ${JSON.stringify(data)}`)
        return
      }

      setMessages(data.messages)
    } catch (e) {
      console.error('Error:', e)
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  if (!contact) return <div>Loading...</div>

  return (
    <div className="p-4">
      <Link href="/contacts" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{contact.first_name}</h1>
        <p className="text-gray-500">{contact.username}</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Анализ диалога</h2>
          <button
            onClick={analyzeHistory}
            disabled={loading}
            className={`px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium 
              hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Lightbulb className="w-5 h-5" />
            Анализировать диалог
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          )}
          
          {!messages.length && !error && !loading && (
            <div className="mt-8 p-8 bg-gray-50 border border-gray-100 rounded-lg text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">
                Нажмите кнопку "Анализировать диалог" чтобы получить анализ переписки
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">История сообщений</h2>
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{message.from_user?.first_name || 'Unknown'}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{message.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 border border-gray-100 rounded-lg text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">
                История сообщений появится после анализа диалога
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 