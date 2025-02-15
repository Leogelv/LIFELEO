// Типы для Telegram WebApp
export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  isExpanded: boolean;
  setBackgroundColor: (color: string) => void;
  initDataUnsafe?: {
    user?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      language_code?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
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