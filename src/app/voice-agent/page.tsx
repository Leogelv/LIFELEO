'use client'

import { useTelegram } from '../hooks/useTelegram'

export default function VoiceAgent() {
  const { isExpanded } = useTelegram()

  return (
    <div className={`${isExpanded ? 'pt-[100px]' : ''}`}>
      <div className="h-[calc(100vh-80px)]">
        <iframe 
          src="https://kpcaller2.vercel.app/"
          className="w-full h-full border-0"
          allow="microphone"
        />
      </div>
    </div>
  )
} 