import type { TelegramWebApp } from '@/types/telegram';

export function initTelegramApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Сначала вызываем ready
    tg.ready();
    
    // Затем настраиваем
    tg.expand();
    tg.setBackgroundColor('#1a1a1a');
    
    // Проверяем и инициализируем MainButton и BackButton
    if (tg.MainButton) {
      tg.MainButton.show();
    }
    if (tg.BackButton) {
      tg.BackButton.show();
    }
    
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