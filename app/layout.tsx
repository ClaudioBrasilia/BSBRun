import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PwaRegister } from '@/components/PwaRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BSBRun — Treinamento Inteligente',
  description: 'Plataforma de treinamento de corrida baseada na metodologia VDOT',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BSBRun',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
