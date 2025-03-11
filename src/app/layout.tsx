import './globals.css';
import { Inter } from 'next/font/google';
import { UserIdProvider } from './contexts/UserContext';
import { SimplePasswordModal } from './components/SimplePasswordModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LIFELEO',
  description: 'Приложение для управления задачами и привычками',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <UserIdProvider>
          <SimplePasswordModal />
          {children}
        </UserIdProvider>
      </body>
    </html>
  );
}
