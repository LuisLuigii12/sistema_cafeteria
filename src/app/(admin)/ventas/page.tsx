'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TopNav from '@/components/shared/TopNav'
import { formatMoney, formatMoneyShort } from '@/lib/format'
import type { Ticket, MetodoPago } from '@/types'

type Periodo = 'hoy' | '7d' | '30d' | 'todo'
const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'hoy', label: 'Hoy' }, { value: '7d', label: '7 días' }, { value: '30d', label: '30 días' }, { value: 'todo', label: 'Todo' },
]
const METODO_LABEL: Record<MetodoPago, string> = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia' }

export default function VentasPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>('hoy')
  const [detalle, setDetalle] = useState<Ticket | null>(null)

  async function fetchTickets() {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
    if (data) setTickets(data as Ticket[])
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
    const channel = supabase.channel('ventas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchTickets)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const desde = useMemo(() => {
    const d = new Date()
    if (periodo === 'hoy') { d.setHours(0, 0, 0, 0); return d }
    if (periodo === '7d') { d.setDate(d.getDate() - 7); return d }
    if (periodo === '30d') { d.setDate(d.getDate() - 30); return d }
    return new Date(0)
  }, [periodo])

  const visibles = useMemo(() => tickets.filter((t) => new Date(t.created_at) >= desde), [tickets, desde])

  const stats = useMemo(() => {
    const total = visibles.reduce((s, t) => s + Number(t.total), 0)
    return { total, count: visibles.length, promedio: visibles.length ? total / visibles.length : 0 }
  }, [visibles])

  return (
    <div className="h-full overflow-y-auto scrollbar-thin" style={{ background: 'var(--bg-cream)' }}>
      <TopNav />
      <main className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--espresso)' }}>Ventas</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>Historial de tickets cobrados</p>
          </div>
          <div className="flex gap-1.5 p-1 rounded-xl self-start" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {PERIODOS.map((p) => (
              <button key={p.value} onClick={() => setPeriodo(p.value)} className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                style={periodo === p.value ? { background: 'var(--espresso)', color: '#FEF8F0' } : { background: 'transparent', color: 'var(--text-muted)' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Vendido', valor: formatMoneyShort(stats.total), color: '#16A34A' },
            { label: 'Tickets', valor: String(stats.count), color: '#A8743F' },
            { label: 'Ticket promedio', valor: formatMoneyShort(stats.promedio), color: '#C9A96E' },
          ].map((s, i) => (
            <div key={s.label} className="rounded-2xl p-4 animate-in" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 50}ms` }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block mb-2" style={{ background: s.color }} />
              <p className="tabular-nums" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--espresso)', lineHeight: 1 }}>{s.valor}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#E8D5BB' }} />)}</div>
        ) : visibles.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p>Sin ventas en este periodo</p>
            <p className="text-xs mt-1">Los tickets aparecen al cobrar una mesa</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibles.map((t, i) => (
              <button key={t.id} onClick={() => setDetalle(t)} className="w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 text-left animate-in"
                style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', animationDelay: `${Math.min(i * 20, 200)}ms` }}>
                <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm tabular-nums" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>
                  #{t.folio}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--espresso)' }}>
                    {t.mesa_numero ? `Mesa ${t.mesa_numero}` : 'Venta'} · {METODO_LABEL[t.metodo_pago] ?? t.metodo_pago}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(t.created_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {(t.items ?? []).reduce((s, it) => s + it.cantidad, 0)} productos
                  </p>
                </div>
                <span className="font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(Number(t.total))}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Detalle del ticket */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(28,10,0,0.55)' }} onClick={() => setDetalle(null)}>
          <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale" style={{ background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-5 text-center" style={{ borderBottom: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Ticket #{detalle.folio}</p>
              <h3 className="font-serif font-bold text-lg" style={{ color: 'var(--espresso)' }}>Valeria&apos;s Coffee</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {detalle.mesa_numero ? `Mesa ${detalle.mesa_numero} · ` : ''}{new Date(detalle.created_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="p-5 space-y-2">
              {(detalle.items ?? []).map((it, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--espresso)' }}><span className="font-bold tabular-nums">{it.cantidad}×</span> {it.nombre}</span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(it.cantidad * it.precio_unitario)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: '2px dashed var(--border)' }}>
                <span className="font-bold" style={{ color: 'var(--espresso)' }}>Total</span>
                <span className="font-serif text-2xl font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(Number(detalle.total))}</span>
              </div>
              <p className="text-xs text-center pt-1" style={{ color: 'var(--text-muted)' }}>Pagado con {METODO_LABEL[detalle.metodo_pago] ?? detalle.metodo_pago}</p>
            </div>
            <div className="p-5 pt-0">
              <button onClick={() => setDetalle(null)} className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: 'var(--espresso)', color: '#FEF8F0' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
