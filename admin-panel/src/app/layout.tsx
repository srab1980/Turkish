import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Turkish Learning Admin Panel',
  description: 'Admin panel for Turkish Language Learning Platform with Istanbul Book Curriculum Integration',
  keywords: ['Turkish', 'language learning', 'admin', 'education', 'curriculum'],
  authors: [{ name: 'Turkish Learning Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Admin panel should not be indexed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-secondary-50 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
