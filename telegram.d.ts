declare global {
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

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
} 