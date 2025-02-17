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
}

interface Telegram {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: Telegram;
  }
} 