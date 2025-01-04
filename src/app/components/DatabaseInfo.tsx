'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import TableViewer from './TableViewer'

type TableInfo = {
  name: string
  count: number
  error?: string
}

export default function DatabaseInfo() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchTableInfo = async () => {
      const realTables = [
        'contacts_userbot_leo',
        'instructions',
        'meditation_courses',
        'meditation_sessions',
        'messages_userbot',
        'msgs',
        'todos',
        'users_shkola',
        'uzerz'
      ]

      const tableInfos = await Promise.all(
        realTables.map(async (tableName): Promise<TableInfo> => {
          try {
            const { count, error } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })

            if (error) return { name: tableName, count: 0, error: error.message }
            return { name: tableName, count: count || 0 }
          } catch (err) {
            return { name: tableName, count: 0, error: 'Ошибка доступа' }
          }
        })
      )

      setTables(tableInfos)
      setLoading(false)
    }

    fetchTableInfo()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {tables.map((table) => (
          <div 
            key={table.name}
            onClick={() => !table.error && setSelectedTable(table.name)}
            className={`p-3 rounded-lg transition-all ${
              table.error 
                ? 'bg-red-500/10 hover:bg-red-500/20' 
                : table.count > 0
                  ? 'bg-purple-500/10 hover:bg-purple-500/20 cursor-pointer'
                  : 'bg-gray-500/10 hover:bg-gray-500/20 cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {table.name}
              </span>
              {table.error ? (
                <span className="text-xs text-red-400">
                  ❌ {table.error}
                </span>
              ) : (
                <span className={`text-xs ${table.count > 0 ? 'text-purple-400' : 'text-gray-400'}`}>
                  {table.count} записей
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <TableViewer 
          tableName={selectedTable} 
          onClose={() => setSelectedTable(null)} 
        />
      )}
    </>
  )
} 