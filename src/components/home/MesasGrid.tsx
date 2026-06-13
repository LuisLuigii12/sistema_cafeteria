'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import MesaModal from '@/components/home/MesaModal'
import type { Mesa, EstadoMesa } from '@/types'

const ESTADO: Record<EstadoMesa, { label: string; accent: string; badge: string; badgeText: string; hint: string }> = {
  libre:     { label: 'Disponible', accent: '#22C55E', badge: '#DCFCE7', badgeText: '#15803D', hint: 'Toca para ordenar' },
  ocupada:   { label: 'Ocupada',    accent: '#C9A96E', badge: '#FEF3E2', badgeText: '#92400E', hint: 'En servicio' },
  por_pagar: { label: 'Por cobrar', accent: '#EF4444', badge: '#FEE2E2', badgeText: '#B91C1C', hint: 'Pendiente de pago' },
}

export default function MesasGrid() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [ordenesActivas, setOrdenesActivas] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)
  const [editando, setEditando] = useState<Mesa | null>(null)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    fetchTodo()
    const channel = supabase
      .channel('mesas-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, fetchTodo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, fetchTodo)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchTodo() {
    const [{ data: mesasData }, { data: ordenesData }] = await Promise.all([
      supabase.from('mesas').select('*').order('numero'),
      supabase.from('ordenes').select('mesa_id').in('estado', ['pendiente', 'en_preparacion', 'listo']),
    ])
    if (mesasData) setMesas(mesasData)
    if (ordenesData) {
      const conteo: Record<string, number> = {}
      ordenesData.forEach((o) => { conteo[o.mesa_id] = (conteo[o.mesa_id] ?? 0) + 1 })
      setOrdenesActivas(conteo)
    }
    setLoading(false)
  }

  function cerrarModal() {
    setEditando(null)
    setCreando(false)
    fetchTodo()
  }

  const libres = mesas.filter(m => m.estado === 'libre').length
  const ocupadas = mesas.filter(m => m.estado === 'ocupada').length
  const porPagar = mesas.filter(m => m.estado === 'por_pagar').length
  const siguienteNumero = mesas.length ? Math.max(...mesas.map(m => m.numero)) + 1 : 1

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#E8D5BB' }} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: '#E8D5BB' }} />
          ))}
        </div>
      </>
    )
  }

  const stats = [
    { label: 'Disponibles', count: libres,   color: '#22C55E' },
    { label: 'Ocupadas',    count: ocupadas, color: '#C9A96E' },
    { label: 'Por cobrar',  count: porPagar, color: '#EF4444' },
  ]

  function CardInterior({ mesa }: { mesa: Mesa }) {
    const e = ESTADO[mesa.estado]
    return (
      <div
        className="group relative h-44 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: e.accent }} />
        <span
          aria-hidden
          className="absolute pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
          style={{ right: -8, bottom: -28, fontFamily: "'Playfair Display', serif", fontSize: '8rem', fontWeight: 700, lineHeight: 1, color: e.accent, opacity: 0.06 }}
        >
          {mesa.numero}
        </span>

        <div className="relative p-5 flex flex-col h-full">
          <div className="flex items-start justify-between">
            <div className="flex items-baseline gap-1.5">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Mesa</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: 'var(--espresso)', lineHeight: 1 }}>
                {mesa.numero}
              </span>
            </div>
            {admin ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                Editar
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: e.badge, color: e.badgeText }}>
                {mesa.estado === 'por_pagar' && <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: e.badgeText }} />}
                {e.label}
              </span>
            )}
          </div>

          <div className="flex-1" />

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: admin ? 'var(--brown)' : e.badgeText }}>
              {admin ? 'Toca para editar' : e.hint}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{mesa.capacidad} pers.</span>
              </div>
              {!admin && (ordenesActivas[mesa.id] ?? 0) > 0 && (
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--gold-soft)', color: 'var(--brown)', border: '1px solid var(--gold)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg>
                  {ordenesActivas[mesa.id]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-xl px-5 py-4 flex items-center justify-between"
            style={{ background: 'var(--bg-card)', borderLeft: `4px solid ${stat.color}`, boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{stat.label}</span>
            </div>
            <span style={{ color: 'var(--espresso)', fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
              {stat.count}
            </span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setAdmin((a) => !a)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
          style={admin
            ? { background: 'var(--espresso)', color: '#FEF8F0' }
            : { background: 'var(--bg-card)', color: 'var(--brown)', border: '1px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {admin ? 'Listo' : 'Administrar mesas'}
        </button>
      </div>

      {/* Mesa grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mesas.map((mesa, i) => (
          <div key={mesa.id} className="animate-in" style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}>
            {admin ? (
              <button onClick={() => setEditando(mesa)} className="w-full text-left cursor-pointer">
                <CardInterior mesa={mesa} />
              </button>
            ) : (
              <Link href={`/mesa/${mesa.id}`}>
                <CardInterior mesa={mesa} />
              </Link>
            )}
          </div>
        ))}

        {/* Add card (solo en modo admin) */}
        {admin && (
          <button
            onClick={() => setCreando(true)}
            className="h-44 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col items-center justify-center gap-2 animate-in"
            style={{ border: '2px dashed var(--gold)', background: 'var(--gold-soft)', color: 'var(--brown)' }}
          >
            <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)', color: 'var(--espresso)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </span>
            <span className="text-sm font-semibold">Agregar mesa</span>
          </button>
        )}
      </div>

      {(editando || creando) && (
        <MesaModal
          mesa={editando}
          sugerenciaNumero={siguienteNumero}
          onGuardar={cerrarModal}
          onCerrar={() => { setEditando(null); setCreando(false) }}
        />
      )}
    </>
  )
}
