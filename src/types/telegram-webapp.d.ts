declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  requestFullscreen: () => void
  isVerticalSwipesEnabled: boolean
  disableVerticalSwipes: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  isFullscreen: boolean
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    auth_date?: string
    hash?: string
  }
  platform: string
  version: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  onEvent(eventType: string, eventHandler: Function): void
  offEvent(eventType: string, eventHandler: Function): void
  sendData(data: any): void
  showAlert(message: string): void
  showConfirm(message: string): Promise<boolean>
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }): Promise<string>
  openLink(url: string): void
  openTelegramLink(url: string): void
  closeScanQrPopup(): void
  readTextFromClipboard(): Promise<string>
  requestWriteAccess(): Promise<boolean>
  requestContact(): Promise<boolean>
  showScanQrPopup(params: {
    text?: string
  }): Promise<string>
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }): Promise<string>
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: Function) => void
    offClick: (callback: Function) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
  }
  BackButton: {
    isVisible: boolean
    onClick: (callback: Function) => void
    offClick: (callback: Function) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
} 