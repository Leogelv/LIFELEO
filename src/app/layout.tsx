import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { NavigationLoader } from './components/ui/NavigationLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vi Passana',
  description: 'Медитация и осознанность',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
      </body>
    </html>
  )
}
