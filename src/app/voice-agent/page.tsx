'use client'

export default function VoiceAgent() {
  return (
    <div className="h-[calc(100vh-80px)]">
      <iframe 
        src="https://kpcaller2.vercel.app/"
        className="w-full h-full border-0"
        allow="microphone"
      />
    </div>
  )
} 