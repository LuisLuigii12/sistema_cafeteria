'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import OrdenCard from '@/components/cocina/OrdenCard'
import type { Orden } from '@/types'

export default function CocinaPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [ahora, setAhora] = useState(new Date())

  useEffect(() => {
    fetchOrdenes()

    const channel = supabase
      .channel('cocina-ordenes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordenes' },
        fetchOrdenes
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orden_items' },
        fetchOrdenes
      )
      .subscribe()

    const interval = setInterval(() => setAhora(new Date()), 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  async function fetchOrdenes() {
    const { data } = await supabase
      .from('ordenes')
      .select(`
        *,
        mesas(numero),
        orden_items(*, productos(nombre))
      `)
      .in('estado', ['pendiente', 'en_preparacion', 'listo'])
      .order('created_at', { ascending: true })

    if (data) setOrdenes(data)
    setLoading(false)
  }

  const pendientes = ordenes.filter((o) => o.estado === 'pendiente')
  const enPreparacion = ordenes.filter((o) => o.estado === 'en_preparacion')
  const listos = ordenes.filter((o) => o.estado === 'listo')

  const cols = [
    { label: 'Nuevas',       count: pendientes.length,    color: '#C9A96E', ordenes: pendientes    },
    { label: 'Preparando',   count: enPreparacion.length, color: '#F59E0B', ordenes: enPreparacion },
    { label: 'Listos',       count: listos.length,        color: '#22C55E', ordenes: listos        },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#100500' }}>
      {/* Header */}
      <header style={{ background: '#1C0A00', borderBottom: '2px solid #C9A96E' }}>
        {/* Top bar */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#C9A96E' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C0A00" strokeWidth="2" strokeLinecap="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                <line x1="6" y1="17" x2="18" y2="17"/>
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700 }}>
                Pantalla Cocina
              </h1>
              <p style={{ color: '#C9A96E', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Valeria&apos;s Coffee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Urgency legend */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              {[['#22C55E','< 5 min'],['#F59E0B','5-10 min'],['#EF4444','> 10 min']].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1.5" style={{ color: 'rgba(254,248,240,0.5)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
            {/* Clock */}
            <div className="text-right">
              <p style={{ color: '#FEF8F0', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                {ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={{ color: '#C9A96E', fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                {ordenes.length} {ordenes.length === 1 ? 'orden activa' : 'órdenes activas'}
              </p>
            </div>
          </div>
        </div>

        {/* Column headers */}
        {!loading && ordenes.length > 0 && (
          <div className="grid grid-cols-3" style={{ borderTop: '1px solid rgba(201,169,110,0.2)' }}>
            {cols.map(col => (
              <div
                key={col.label}
                className="px-6 py-2 flex items-center gap-2"
                style={{ borderRight: '1px solid rgba(201,169,110,0.1)' }}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col.color, boxShadow: `0 0 8px ${col.color}` }} />
                <span style={{ color: col.color, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {col.label}
                </span>
                <span
                  className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: col.count > 0 ? col.color : 'rgba(254,248,240,0.1)', color: col.count > 0 ? '#1C0A00' : 'rgba(254,248,240,0.3)' }}
                >
                  {col.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p style={{ color: 'rgba(201,169,110,0.4)' }}>Cargando órdenes...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.08)', border: '2px dashed rgba(201,169,110,0.2)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.3)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="text-center">
              <p style={{ color: 'rgba(201,169,110,0.5)', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600 }}>
                Todo al día
              </p>
              <p style={{ color: 'rgba(254,248,240,0.2)', fontSize: '0.85rem', marginTop: 4 }}>
                Las nuevas órdenes aparecerán aquí automáticamente
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 h-full" style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}>
            {cols.map((col, i) => (
              <div
                key={col.label}
                className="p-4 overflow-y-auto scrollbar-thin"
                style={{
                  borderRight: i < 2 ? '1px solid rgba(201,169,110,0.1)' : undefined,
                  minHeight: 'calc(100vh - 140px)',
                }}
              >
                <div className="space-y-4">
                  {col.ordenes.map((orden) => (
                    <OrdenCard key={orden.id} orden={orden} />
                  ))}
                  {col.ordenes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={`${col.color}40`} strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <p style={{ color: `${col.color}30`, fontSize: '0.75rem' }}>Sin órdenes</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
