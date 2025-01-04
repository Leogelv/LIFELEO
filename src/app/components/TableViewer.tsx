'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

type TableData = Record<string, any>

export default function TableViewer({ 
  tableName, 
  onClose 
}: { 
  tableName: string
  onClose: () => void
}) {
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(100)

        if (error) throw error
        setData(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tableName, supabase])

  const toggleRow = (index: number) => {
    setExpandedRows(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const formatValue = (value: any, expanded = false) => {
    if (value === null) return ''
    if (typeof value === 'object') return JSON.stringify(value, null, expanded ? 2 : 0)
    return String(value)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900/90 p-8 rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900/90 p-8 rounded-xl max-w-4xl w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-red-400">Ошибка</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900/90 p-8 rounded-xl max-w-4xl w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Таблица пуста</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400">В таблице {tableName} нет записей</p>
        </div>
      </div>
    )
  }

  // Получаем все уникальные ключи из данных
  const columns = Array.from(
    new Set(
      data.flatMap(item => Object.keys(item))
    )
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 p-8 rounded-xl max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <span className="font-mono text-purple-400">{tableName}</span>
            <span className="text-sm text-gray-400">({data.length} записей)</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-all"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="w-8"></th>
                {columns.map(column => (
                  <th 
                    key={column} 
                    className="p-2 text-left text-sm font-mono text-purple-400 sticky top-0 bg-gray-900/90"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {data.map((row, i) => {
                const isExpanded = expandedRows.includes(i)
                const rowId = row.id || i // Используем id из данных или индекс как запасной вариант
                return (
                  <tr 
                    key={rowId}
                    className="hover:bg-gray-800/30 transition-all group"
                  >
                    <td className="w-8 p-2">
                      <button
                        onClick={() => toggleRow(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className={`inline-block transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                    </td>
                    {columns.map(column => {
                      const value = formatValue(row[column])
                      const needsExpansion = value.length > 50
                      return (
                        <td 
                          key={`${rowId}-${column}`}
                          className="p-2 text-sm font-mono text-gray-300"
                        >
                          <div 
                            className={`${needsExpansion && !isExpanded ? 'max-h-[200px] overflow-hidden' : ''}`}
                            style={{ maxWidth: '350px' }}
                          >
                            {isExpanded ? (
                              <pre className="whitespace-pre-wrap break-words">
                                {formatValue(row[column], true)}
                              </pre>
                            ) : (
                              <div className="truncate">
                                {value}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 