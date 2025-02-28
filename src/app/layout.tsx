import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { NavigationLoader } from './components/ui/NavigationLoader'
import LogViewer from './components/LogViewer'
import Script from 'next/script'

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
  // Определяем, находимся ли мы в Telegram WebApp
  const isTelegramWebApp = typeof window !== 'undefined' && 
    window.location.href.includes('tgWebAppData') || 
    window.location.href.includes('tgWebAppPlatform');

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify({
              NEXT_PUBLIC_YANDEX_API_KEY: process.env.NEXT_PUBLIC_YANDEX_API_KEY,
            })}`,
          }}
        />
        {/* Загружаем скрипт Telegram WebApp, даже если не в Telegram, для совместимости */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <NavigationLoader />
        {children}
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
      </body>
    </html>
  )
}
