import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { NavigationLoader } from './components/ui/NavigationLoader'
import LogViewer from './components/LogViewer'
import Script from 'next/script'
import { UserIdProvider } from './contexts/UserIdContext'
import { PasswordProtection } from './components/PasswordProtection'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LIFELEO',
  description: 'Life management app',
}

// Expose environment variables to the client
export const runtime = 'edge'
export const preferredRegion = 'auto'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Определяем, находимся ли мы в Telegram WebApp - но только на клиенте
  // Используем функцию, чтобы избежать выполнения на сервере
  const getTelegramWebAppStatus = () => {
    if (typeof window === 'undefined') return false;
    return window.location.href.includes('tgWebAppData') || 
           window.location.href.includes('tgWebAppPlatform');
  };

  // Не используем результат функции напрямую в рендеринге,
  // чтобы избежать ошибок гидрации

  return (
    <html lang="en">
      <head>
        {/* Загружаем скрипт Telegram WebApp для совместимости, но только в Telegram */}
        <Script id="check-telegram-env">
          {`
            // Определяем, находимся ли мы в Telegram
            function isTelegramEnvironment() {
              if (typeof window === 'undefined') return false;
              
              // Проверяем URL параметры от Telegram
              const hasTelegramParams = window.location.href.includes('tgWebAppData') || 
                                        window.location.href.includes('tgWebAppPlatform');
              
              // Проверяем мобильное приложение через User-Agent
              const userAgent = window.navigator.userAgent || '';
              const isTelegramUserAgent = userAgent.includes('Telegram') || userAgent.includes('TelegramBot');
              
              // Проверяем URL параметр для принудительного отключения
              const urlParams = new URLSearchParams(window.location.search);
              const forceWeb = urlParams.get('force_web') === 'true';
              
              // Если явно указано использовать веб-версию, то не загружаем скрипт
              if (forceWeb) {
                console.log('🌐 Принудительно использую веб-версию (force_web=true)');
                return false;
              }
              
              console.log('📱 Определение окружения в layout:', { 
                hasTelegramParams, 
                isTelegramUserAgent,
                userAgent,
                forceWeb
              });
              
              return hasTelegramParams || isTelegramUserAgent;
            }
            
            // Если мы в Telegram, динамически добавляем скрипт
            if (isTelegramEnvironment()) {
              console.log('🔄 Загружаю Telegram WebApp скрипт...');
              const script = document.createElement('script');
              script.src = 'https://telegram.org/js/telegram-web-app.js';
              script.async = true;
              document.head.appendChild(script);
            } else {
              console.log('🌐 Не в Telegram, не загружаю Telegram WebApp скрипт');
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <UserIdProvider>
          <NavigationLoader />
          <PasswordProtection>
            {children}
          </PasswordProtection>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#2A2A2A',
                border: '1px solid #333333',
                color: '#E8D9C5',
              }
            }}
          />
          <LogViewer />
        </UserIdProvider>
      </body>
    </html>
  )
}
