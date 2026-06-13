import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Valeria's Coffee",
  description: 'Sistema de órdenes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Valeria's Coffee",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1C0A00',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* iOS home screen icon */}
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="h-full antialiased font-sans overflow-hidden">{children}</body>
    </html>
  )
}
