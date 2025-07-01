import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Turkish Learning Admin',
  description: 'Admin panel for Turkish language learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
