'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { lockAdmin } from '@/lib/admin'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
}

const OPERACION: NavItem[] = [
  { href: '/', label: 'Mesas', icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { href: '/cocina', label: 'Cocina', icon: <><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" y1="17" x2="18" y2="17" /></> },
  { href: '/cafeteria', label: 'Cafetería', icon: <><path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></> },
]

const ADMIN: NavItem[] = [
  { href: '/inventario', label: 'Inventario', icon: <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></> },
  { href: '/ventas', label: 'Ventas', icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" /><path d="M8 7h8M8 11h8M8 15h5" /></> },
  { href: '/finanzas', label: 'Finanzas', icon: <><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
]

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const enAdmin = pathname.startsWith('/inventario') || pathname.startsWith('/finanzas') || pathname.startsWith('/ventas')
  const items = enAdmin ? ADMIN : OPERACION

  function salir() {
    lockAdmin()
    router.push('/')
  }

  return (
    <header
      className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30"
      style={{ background: 'linear-gradient(180deg, #230D02 0%, #160600 100%)', borderBottom: '2px solid var(--gold)', boxShadow: '0 6px 20px -8px rgba(40,20,7,0.5)' }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Valeria's Coffee" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: '50%' }} />
        <div className="hidden sm:block">
          <h1 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.1 }}>
            Valeria&apos;s Coffee
          </h1>
          <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {enAdmin ? 'Administración' : 'Punto de Venta'}
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1.5 sm:gap-2">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={active ? { background: 'var(--gold)', color: 'var(--espresso)' } : { background: 'rgba(255,255,255,0.06)', color: '#F0E3D0' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}

        {/* Separador + acceso/salida de administración */}
        <span className="w-px h-7 mx-1" style={{ background: 'rgba(201,169,110,0.25)' }} />
        {enAdmin ? (
          <button
            onClick={salir}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--gold)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        ) : (
          <Link
            href="/inventario"
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--gold)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            <span className="hidden sm:inline">Administración</span>
          </Link>
        )}
      </nav>
    </header>
  )
}
