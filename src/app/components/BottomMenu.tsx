import { Icon } from '@iconify/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const BottomMenu = () => {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/80 backdrop-blur-lg border-t border-[#E8D9C5]/10 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          <Link 
            href="/profile" 
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === '/profile' 
                ? 'text-[#E8D9C5]' 
                : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            <Icon icon="solar:user-bold" className="w-6 h-6" />
            <span className="text-xs">Профиль</span>
          </Link>
          
          <Link 
            href="/voice-agent" 
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === '/voice-agent' 
                ? 'text-[#E8D9C5]' 
                : 'text-[#E8D9C5]/60 hover:text-[#E8D9C5]/80'
            }`}
          >
            <Icon icon="solar:microphone-bold" className="w-6 h-6" />
            <span className="text-xs">Голосовой агент</span>
          </Link>
        </div>
      </div>
    </div>
  )
} 