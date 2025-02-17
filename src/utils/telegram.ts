import type { TelegramWebApp } from '@/types/telegram'

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