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
      <body className="h-full antialiased font-sans overflow-hidden">
        <div id="app-splash" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#1C0A00',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
          transition: 'opacity 0.3s ease',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
            <line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
          </svg>
          <p style={{ color: '#C9A96E', fontFamily: 'serif', fontSize: '1.2rem', letterSpacing: '0.05em' }}>Valeria&apos;s Coffee</p>
          <div style={{
            width: '32px', height: '32px', border: '3px solid rgba(201,169,110,0.2)',
            borderTop: '3px solid #C9A96E', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            var s = document.getElementById('app-splash');
            if (s) { s.style.opacity = '0'; setTimeout(function(){ s.remove(); }, 300); }
          });
        `}} />
        {children}
      </body>
    </html>
  )
}
