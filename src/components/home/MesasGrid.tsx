'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MesaModal from '@/components/home/MesaModal'
import CobrarModal from '@/components/mesa/CobrarModal'
import type { Mesa, EstadoMesa } from '@/types'

const ESTADO: Record<EstadoMesa, { label: string; accent: string; badge: string; badgeText: string; hint: string }> = {
  libre:     { label: 'Disponible', accent: '#22C55E', badge: '#DCFCE7', badgeText: '#15803D', hint: 'Toca para ordenar' },
  ocupada:   { label: 'Ocupada',    accent: '#C9A96E', badge: '#FEF3E2', badgeText: '#92400E', hint: 'En servicio' },
  por_pagar: { label: 'Por cobrar', accent: '#EF4444', badge: '#FEE2E2', badgeText: '#B91C1C', hint: 'Pendiente de pago' },
}

export default function MesasGrid() {
  const router = useRouter()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [ordenesActivas, setOrdenesActivas] = useState<Record<string, number>>({})
  const [listosPorMesa, setListosPorMesa] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)
  const [cobrando, setCobrando] = useState<Mesa | null>(null)
  const [editando, setEditando] = useState<Mesa | null>(null)
  const [creando, setCreando] = useState(false)

  async function fetchTodo() {
    const [{ data: mesasData }, { data: ordenesData }] = await Promise.all([
      supabase.from('mesas').select('*').order('numero'),
      supabase.from('ordenes').select('mesa_id, estado').in('estado', ['pendiente', 'en_preparacion', 'listo']),
    ])
    if (mesasData) setMesas(mesasData)
    if (ordenesData) {
      const activas: Record<string, number> = {}
      const listos: Record<string, number> = {}
      ordenesData.forEach((o) => {
        activas[o.mesa_id] = (activas[o.mesa_id] ?? 0) + 1
        if (o.estado === 'listo') listos[o.mesa_id] = (listos[o.mesa_id] ?? 0) + 1
      })
      setOrdenesActivas(activas)
      setListosPorMesa(listos)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTodo()
    const channel = supabase
      .channel('mesas-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, fetchTodo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, fetchTodo)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

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

  function Tarjeta({ mesa }: { mesa: Mesa }) {
    const e = ESTADO[mesa.estado]
    const listo = !admin && (listosPorMesa[mesa.id] ?? 0) > 0
    const activas = !admin && (ordenesActivas[mesa.id] ?? 0) > 0
    const mostrarCobrar = !admin && mesa.estado !== 'libre'

    return (
      <div
        className="relative h-44 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: e.accent, zIndex: 1 }} />
        <span
          aria-hidden
          className="absolute pointer-events-none select-none"
          style={{ right: -8, bottom: -28, fontFamily: "'Playfair Display', serif", fontSize: '8rem', fontWeight: 700, lineHeight: 1, color: e.accent, opacity: 0.06 }}
        >
          {mesa.numero}
        </span>

        {/* Cuerpo: toca para ordenar (o editar en modo admin) */}
        <div
          onClick={() => (admin ? setEditando(mesa) : router.push(`/mesa/${mesa.id}`))}
          className="relative flex-1 p-5 flex flex-col cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Mesa</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: 'var(--espresso)', lineHeight: 1 }}>
                {mesa.numero}
              </span>
            </div>
            {admin ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                Editar
              </span>
            ) : listo ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 pulse-dot flex-shrink-0" style={{ background: 'var(--green-soft)', color: 'var(--green-text)', border: '1px solid #86EFAC' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                Listo
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0" style={{ background: e.badge, color: e.badgeText }}>
                {e.label}
              </span>
            )}
          </div>

          <div className="flex-1" />

          <p className="text-xs font-medium" style={{ color: admin ? 'var(--brown)' : e.badgeText }}>
            {admin ? 'Toca para editar' : listo ? 'Listo para recoger' : activas ? `${ordenesActivas[mesa.id]} en preparación` : e.hint}
          </p>
        </div>

        {/* Cobrar — un toque, sin entrar al menú */}
        {mostrarCobrar && (
          <button
            onClick={() => setCobrando(mesa)}
            className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] flex-shrink-0"
            style={{ background: '#16A34A', color: '#F0FDF4' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Cobrar
          </button>
        )}
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
            <Tarjeta mesa={mesa} />
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

      {cobrando && (
        <CobrarModal
          mesaId={cobrando.id}
          mesaNumero={cobrando.numero}
          onCobrado={() => { setCobrando(null); fetchTodo() }}
          onCerrar={() => setCobrando(null)}
        />
      )}
    </>
  )
}
