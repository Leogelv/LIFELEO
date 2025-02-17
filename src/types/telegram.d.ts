export interface TelegramWebAppUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramWebAppInitData {
  user?: TelegramWebAppUser;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  isExpanded: boolean;
  setBackgroundColor: (color: string) => void;
  initDataUnsafe?: TelegramWebAppInitData;
  platform: string;
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

export interface TelegramType {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram: TelegramType;
  }
} 