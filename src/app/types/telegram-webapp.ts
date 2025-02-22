export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  requestFullscreen: () => void
  isVerticalSwipesEnabled: boolean
  disableVerticalSwipes: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  viewportHeight: number
  viewportStableHeight: number
  MainButton: any
  BackButton: any
  platform: string
  colorScheme: string
  themeParams: any
  isExpanded: boolean
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onEvent: (eventType: string, eventHandler: Function) => void
  offEvent: (eventType: string, eventHandler: Function) => void
  sendData: (data: any) => void
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string) => void
  showPopup: (params: any) => void
  showAlert: (message: string) => void
  showConfirm: (message: string) => void
  showScanQrPopup: (params?: any) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: () => Promise<string>
  requestWriteAccess: () => Promise<boolean>
  requestContact: () => Promise<boolean>
  HapticFeedback: any
  CloudStorage: any
  version: string
  initData: string
  initDataUnsafe?: {
    user?: {
      id?: number
      photo_url?: string
      username?: string
      first_name?: string
    }
    start_param?: string
  }
  headerColor: string
  backgroundColor: string
  SafeAreaInset: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
} 