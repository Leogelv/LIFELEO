'use client'

import { Contact } from '@/types/contacts'
import { useEffect, useRef } from 'react'
import { AnalysisCard } from './analysis/AnalysisCard'
import { MessageHistory } from './analysis/MessageHistory'
import { ParticipantInfo } from './analysis/ParticipantInfo'

interface Props {
  contact: Contact
  onClose: () => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export function ContactCard({ contact, onClose, onAnalyze, isAnalyzing }: Props) {
  const summary = contact.summary || contact.history?.analysis
  const messages = contact.history?.raw?.messages || []
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (modalRef.current) {
      const scrollY = window.scrollY
      modalRef.current.style.top = `${scrollY}px`
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '15px'
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto z-50"
         ref={modalRef}>
      <div className="my-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
        border border-gray-800/50 rounded-2xl p-6 max-w-4xl w-full
        shadow-[0_0_30px_rgba(0,0,0,0.3)] animate-fadeIn">
        {/* Хедер */}
        <div className="relative mb-8 p-[1px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="flex justify-between items-center p-4 bg-gray-900/95 rounded-xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
              text-transparent bg-clip-text">
              {contact.first_name} {contact.last_name}
              <span className="text-lg ml-2 text-gray-400">@{contact.username}</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white 
                transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Анализ диалога */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Анализ диалога</h3>
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                  text-white font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAnalyzing ? (
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

            {summary ? (
              <div className="space-y-6">
                <AnalysisCard analysis={summary} />
                {summary.participants && <ParticipantInfo participants={summary.participants} />}
              </div>
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
                  Нажмите "Анализировать диалог" чтобы получить анализ переписки
                </p>
              </div>
            )}
          </div>

          {/* История сообщений */}
          <MessageHistory messages={messages} />
        </div>
      </div>
    </div>
  )
} 