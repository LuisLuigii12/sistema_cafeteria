import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Valeria's Coffee",
  description: 'Sistema de punto de venta',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full antialiased font-sans">{children}</body>
    </html>
  )
}
