export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  isExpanded: boolean
  isVerticalSwipesEnabled: boolean
  disableVerticalSwipes: () => void
  enableVerticalSwipes: () => void
  addToHomeScreen?: () => void
  initDataUnsafe?: {
    user?: TelegramUser
    start_param?: string
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
} 