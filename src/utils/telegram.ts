// Типы для Telegram WebApp
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  isExpanded: boolean;
  disableClosingConfirmation: () => void;
  setBackgroundColor: (color: string) => void;
  MainButton: {
    hide: () => void;
  };
  BackButton: {
    hide: () => void;
  };
  themeParams: {
    bg_color: string;
    secondary_bg_color: string;
    text_color: string;
  };
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

export function initTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Применяем настройки
    tg.expand(); // Разворачиваем на весь экран
    
    // Отключаем свайпы
    tg.disableClosingConfirmation();
    tg.setBackgroundColor('#1a1a1a');
    
    // Настраиваем хедер
    tg.MainButton.hide();
    tg.BackButton.hide();
    
    // Устанавливаем цвета темы
    tg.themeParams.bg_color = '#1a1a1a';
    tg.themeParams.secondary_bg_color = '#2a2a2a';
    tg.themeParams.text_color = '#ffffff';
    
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