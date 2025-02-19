export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  requestFullscreen: () => void
  isVerticalSwipesEnabled: boolean
  disableVerticalSwipes: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  initDataUnsafe?: {
    user?: {
      photo_url?: string
      username?: string
      first_name?: string
    }
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
} 