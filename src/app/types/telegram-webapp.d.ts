interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  isExpanded: boolean
  onEvent: (eventType: string, callback: () => void) => void
  MainButton: {
    text: string
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
  }
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
  }
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      photo_url?: string
    }
    start_param?: string
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  }
  requestFullscreen: () => void
  isVerticalSwipesEnabled: boolean
  disableVerticalSwipes: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  addToHomeScreen: () => void
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
} 