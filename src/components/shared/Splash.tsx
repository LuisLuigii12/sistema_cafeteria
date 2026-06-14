'use client'

import { useEffect, useState } from 'react'

/**
 * Pantalla de carga inicial (PWA). Se renderiza en SSR y en cliente igual
 * (sin <style> ni <script> sueltos), así no rompe la hidratación. Se desvanece
 * sola en cuanto la app queda interactiva.
 */
export default function Splash() {
  const [visible, setVisible] = useState(true)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 450)
    const t2 = setTimeout(() => setVisible(false), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#1C0A00',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: fade ? 'none' : 'auto',
      }}
    >
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
      </svg>
      <p style={{ color: '#C9A96E', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', letterSpacing: '0.05em' }}>
        Valeria&apos;s Coffee
      </p>
      <div
        style={{
          width: '32px', height: '32px',
          border: '3px solid rgba(201,169,110,0.2)', borderTop: '3px solid #C9A96E', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}
