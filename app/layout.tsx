// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/ui/AppShell';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Learnify – AI-Powered Personalized Learning',
  description:
    'Boost your knowledge with Learnify, an AI-powered, gamified learning platform designed for personalized student growth.',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9', // This should match your brand or manifest theme
  icons: {
    icon: [
      { url: '/Learnify.svg', type: 'image/svg+xml', sizes: '192x192' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300 flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
