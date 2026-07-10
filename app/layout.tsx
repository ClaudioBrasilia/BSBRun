import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BSBRun — Treinamento Inteligente',
  description: 'Plataforma de treinamento de corrida baseada na metodologia VDOT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
