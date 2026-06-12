'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Mesa, EstadoMesa } from '@/types'

const ESTADO: Record<EstadoMesa, { label: string; accent: string; bg: string; text: string; badge: string; badgeText: string }> = {
  libre:    { label: 'Disponible', accent: '#22C55E', bg: '#FFFFFF',   text: '#1C0A00', badge: '#DCFCE7', badgeText: '#15803D' },
  ocupada:  { label: 'Ocupada',    accent: '#C9A96E', bg: '#FFFBF5',   text: '#1C0A00', badge: '#FEF3E2', badgeText: '#92400E' },
  por_pagar:{ label: 'Por pagar',  accent: '#EF4444', bg: '#FFF5F5',   text: '#1C0A00', badge: '#FEE2E2', badgeText: '#B91C1C' },
}

export default function MesasGrid() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMesas()
    const channel = supabase
      .channel('mesas-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, fetchMesas)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchMesas() {
    const { data } = await supabase.from('mesas').select('*').order('numero')
    if (data) setMesas(data)
    setLoading(false)
  }

  const libres = mesas.filter(m => m.estado === 'libre').length
  const ocupadas = mesas.filter(m => m.estado === 'ocupada').length
  const porPagar = mesas.filter(m => m.estado === 'por_pagar').length

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#E8D5BB' }} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: '#E8D5BB' }} />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Disponibles', count: libres,    color: '#22C55E', bg: '#FFFFFF' },
          { label: 'Ocupadas',    count: ocupadas,  color: '#C9A96E', bg: '#FFFFFF' },
          { label: 'Por cobrar',  count: porPagar,  color: '#EF4444', bg: '#FFFFFF' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl px-5 py-4 flex items-center justify-between"
            style={{ background: stat.bg, borderLeft: `4px solid ${stat.color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <span style={{ color: '#78350F', fontSize: '0.8rem', fontWeight: 500 }}>{stat.label}</span>
            <span style={{ color: '#1C0A00', fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
              {stat.count}
            </span>
          </div>
        ))}
      </div>

      {/* Mesa grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mesas.map((mesa) => {
          const e = ESTADO[mesa.estado]
          return (
            <Link key={mesa.id} href={`/mesa/${mesa.id}`}>
              <div
                className="relative h-44 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                style={{ background: e.bg, borderTop: `4px solid ${e.accent}`, boxShadow: '0 2px 8px rgba(28,10,0,0.1)' }}
              >
                {/* Accent stripe top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: e.accent }} />

                <div className="p-5 flex flex-col h-full">
                  {/* Number + badge */}
                  <div className="flex items-start justify-between">
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 700, color: '#1C0A00', lineHeight: 1 }}>
                      {mesa.numero}
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: e.badge, color: e.badgeText }}
                    >
                      {e.label}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Bottom info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span style={{ color: '#78350F', fontSize: '0.75rem' }}>{mesa.capacidad} personas</span>
                    </div>
                    {mesa.estado !== 'libre' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={e.accent} strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
