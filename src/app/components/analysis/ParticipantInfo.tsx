'use client'

interface Participant {
  roles?: string[]
  interests?: string[]
  communicationStyle?: string[]
}

interface Props {
  participants: Participant
}

export function ParticipantInfo({ participants }: Props) {
  const hasRoles = participants.roles && participants.roles.length > 0
  const hasInterests = participants.interests && participants.interests.length > 0
  const hasStyles = participants.communicationStyle && participants.communicationStyle.length > 0

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
      hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
      <h3 className="text-xl font-semibold text-white mb-4">Участники</h3>
      <div className="space-y-4">
        {hasRoles && (
          <div>
            <h4 className="text-gray-400 mb-2">Роли</h4>
            <div className="space-y-2">
              {participants.roles!.map((role, i) => (
                <div key={i} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30
                    border border-gray-600/30">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-gray-200">{role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {hasInterests && (
          <div>
            <h4 className="text-gray-400 mb-2">Интересы</h4>
            <div className="flex flex-wrap gap-2">
              {participants.interests!.map((interest, i) => (
                <span key={i}
                  className="px-3 py-1 rounded-lg text-sm
                    bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasStyles && (
          <div>
            <h4 className="text-gray-400 mb-2">Стиль общения</h4>
            <div className="flex flex-wrap gap-2">
              {participants.communicationStyle!.map((style, i) => (
                <span key={i}
                  className="px-3 py-1 rounded-lg text-sm
                    bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  {style}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 