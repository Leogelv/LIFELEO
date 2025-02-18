interface TelegramWebAppUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TelegramWebAppInitData {
  user?: TelegramWebAppUser;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  isExpanded: boolean;
  setBackgroundColor: (color: string) => void;
  initDataUnsafe?: TelegramWebAppInitData;
  platform: 'android' | 'ios' | 'web' | 'unknown';
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setViewportHeight: (height: number) => void;
  onEvent: (eventType: string, callback: () => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
  };
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
}

interface TelegramType {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram: TelegramType;
  }
}

export function initTelegramApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Применяем настройки
    tg.expand(); // Разворачиваем на весь экран
    tg.setBackgroundColor('#1a1a1a');
    
    // В конце вызываем ready
    tg.ready();
    
    return tg;
  }
  return null;
}

export function getUserPhotoUrl(): string | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    return tg.initDataUnsafe?.user?.photo_url || null;
  }
  return null;
} 