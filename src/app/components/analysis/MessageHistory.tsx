'use client'

interface Message {
  text: string
  date: string
  from_user: boolean
}

interface Props {
  messages: Message[]
}

export function MessageHistory({ messages }: Props) {
  return (
    <div className="relative">
      <h3 className="text-2xl font-bold text-white mb-6">История сообщений</h3>
      
      <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
        {messages.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4
            scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-gray-800/30">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.from_user ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative group max-w-[60%] ${msg.from_user ? 'ml-12' : 'mr-12'}`}>
                  {/* Время сообщения (появляется при наведении) */}
                  <div className={`absolute top-0 ${msg.from_user ? 'right-full mr-2' : 'left-full ml-2'}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    text-xs text-gray-500 whitespace-nowrap pt-2`}>
                    {new Date(msg.date).toLocaleString()}
                  </div>
                  
                  <div className={`p-4 rounded-2xl backdrop-blur-sm
                    ${msg.from_user 
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-tr-sm' 
                      : 'bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/30 rounded-tl-sm'
                    }`}>
                    <p className="text-gray-200 break-words">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              История сообщений появится после анализа
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 