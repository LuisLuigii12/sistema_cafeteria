import MesasGrid from '@/components/home/MesasGrid'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#F5EDE0' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: '#1C0A00', borderBottom: '2px solid #C9A96E' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#C9A96E' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C0A00" strokeWidth="2" strokeLinecap="round">
              <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
              <line x1="6" y1="2" x2="6" y2="4"/>
              <line x1="10" y1="2" x2="10" y2="4"/>
              <line x1="14" y1="2" x2="14" y2="4"/>
            </svg>
          </div>
          <div>
            <h1 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.2 }}>
              Valeria&apos;s Coffee
            </h1>
            <p style={{ color: '#C9A96E', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Sistema de Órdenes
            </p>
          </div>
        </div>

        <Link
          href="/cocina"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer hover:opacity-90"
          style={{ background: '#C9A96E', color: '#1C0A00' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
            <line x1="6" y1="17" x2="18" y2="17"/>
          </svg>
          Ver Cocina
        </Link>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1C0A00' }}>
              Mesas
            </h2>
            <p style={{ color: '#78350F', fontSize: '0.875rem', marginTop: 2 }}>
              Toca una mesa para registrar una orden
            </p>
          </div>
        </div>
        <MesasGrid />
      </main>
    </div>
  )
}
