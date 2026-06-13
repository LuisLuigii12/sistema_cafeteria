'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
}

const ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Mesas',
    icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  },
  {
    href: '/cocina',
    label: 'Cocina',
    icon: <><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" y1="17" x2="18" y2="17" /></>,
  },
  {
    href: '/inventario',
    label: 'Inventario',
    icon: <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
  },
  {
    href: '/finanzas',
    label: 'Finanzas',
    icon: <><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
  },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <header
      className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30"
      style={{ background: 'var(--espresso)', borderBottom: '2px solid var(--gold)' }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--espresso)" strokeWidth="2" strokeLinecap="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
        <div className="hidden sm:block">
          <h1 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.1 }}>
            Valeria&apos;s Coffee
          </h1>
          <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Punto de Venta
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1.5 sm:gap-2">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={
                active
                  ? { background: 'var(--gold)', color: 'var(--espresso)' }
                  : { background: 'rgba(255,255,255,0.06)', color: '#F0E3D0' }
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
