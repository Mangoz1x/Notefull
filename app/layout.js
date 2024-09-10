'use client';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Roboto } from 'next/font/google';
import ClientThemeProvider from '@/components/ClientThemeProvider';
import Navbar from '@/components/layout/Navbar';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body className='bg-gray-100 dark:bg-gray-950'>
        <ClientThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
