export function initTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Базовые настройки
    tg.ready();
    tg.expand();
    
    // Отключаем вертикальные свайпы
    if (tg.isVerticalSwipesEnabled) {
      tg.disableVerticalSwipes();
    }
    
    // Устанавливаем цвета
    tg.setHeaderColor('#1a1a1a');
    tg.setBackgroundColor('#1a1a1a');
    
    return tg;
  }
  return null;
}

export function getUserPhotoUrl(): string | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe?.user?.photo_url || null;
  }
  return null;
}

// Типы для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        isVerticalSwipesEnabled: boolean;
        disableVerticalSwipes: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        initDataUnsafe?: {
          user?: {
            photo_url?: string;
          };
        };
      };
    };
  }
} 