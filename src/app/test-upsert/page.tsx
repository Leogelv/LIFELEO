'use client'

import { useState } from 'react'
import { testUpsertContact } from '@/app/actions/contacts'

export default function TestUpsert() {
  const [chatId, setChatId] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleTest() {
    setLoading(true)
    try {
      const testChat = {
        chat_id: parseInt(chatId),
        title: `Test Chat ${chatId}`,
        username: `test_${chatId}`,
        last_message: `Test message ${new Date().toISOString()}`,
        chat_type: 'group',
        members_count: 100,
        is_pinned: false,
        unread_count: 0
      }

      const results = await testUpsertContact(testChat)
      setResults(results)
      console.log('🧪 Результаты тестов:', results)
    } catch (error) {
      console.error('❌ Ошибка:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Test Upsert Methods</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chat ID для теста
          </label>
          <input
            type="number"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 
              text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Введите chat_id"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading || !chatId}
          className={`px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 
            text-white font-medium transform hover:scale-105 transition-all duration-200 
            hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
            ${loading ? 'animate-pulse' : ''}`}
        >
          {loading ? 'Тестируем...' : 'Запустить тест'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mt-8">Результаты:</h2>
          <div className="bg-gray-900/50 rounded-xl p-4 overflow-auto">
            <pre className="text-sm text-gray-300">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 