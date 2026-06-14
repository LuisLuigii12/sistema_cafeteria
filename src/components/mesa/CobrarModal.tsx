'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney } from '@/lib/format'
import type { Orden, TicketItem, MetodoPago } from '@/types'

interface Props {
  mesaId: string
  mesaNumero: number
  onCobrado: () => void
  onCerrar: () => void
}

const METODOS: { value: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></> },
  { value: 'tarjeta', label: 'Tarjeta', icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></> },
  { value: 'transferencia', label: 'Transferencia', icon: <><path d="M3 7h18M3 7l4-4M3 7l4 4" /><path d="M21 17H3M21 17l-4-4M21 17l-4 4" /></> },
]

export default function CobrarModal({ mesaId, mesaNumero, onCobrado, onCerrar }: Props) {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    ;(async () => {
      const { data } = await supabase
        .from('ordenes')
        .select('*, orden_items(*, productos(nombre))')
        .eq('mesa_id', mesaId)
        .in('estado', ['pendiente', 'en_preparacion', 'listo', 'entregado'])
        .order('created_at')
      // Resiliente: si la columna 'pagado' aún no existe, se incluyen todas.
      const pendientes = (data ?? []).filter((o) => !o.pagado) as Orden[]
      if (activo) { setOrdenes(pendientes); setLoading(false) }
    })()
    return () => { activo = false }
  }, [mesaId])

  // Combina todos los items de todas las órdenes en una sola cuenta
  const cuenta = useMemo(() => {
    const mapa = new Map<string, TicketItem>()
    for (const o of ordenes) {
      for (const it of o.orden_items ?? []) {
        const nombre = it.productos?.nombre ?? 'Producto'
        const key = `${nombre}__${it.precio_unitario}`
        const cur = mapa.get(key) ?? { nombre, cantidad: 0, precio_unitario: Number(it.precio_unitario) }
        cur.cantidad += it.cantidad
        mapa.set(key, cur)
      }
    }
    const items = [...mapa.values()]
    const total = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0)
    return { items, total }
  }, [ordenes])

  async function cobrar() {
    setProcesando(true); setError(null)
    const { error: tErr } = await supabase.from('tickets').insert({
      mesa_numero: mesaNumero,
      total: cuenta.total,
      metodo_pago: metodo,
      items: cuenta.items,
    })
    if (tErr) {
      setError('No se pudo generar el ticket. ¿Corriste la migración 005 en Supabase?')
      setProcesando(false)
      return
    }
    await supabase.from('ordenes').update({ pagado: true, estado: 'entregado' })
      .eq('mesa_id', mesaId).neq('estado', 'cancelado')
    await supabase.from('mesas').update({ estado: 'libre' }).eq('id', mesaId)
    onCobrado()
  }

  async function liberarSinCobrar() {
    setProcesando(true)
    await supabase.from('ordenes').update({ estado: 'cancelado' })
      .eq('mesa_id', mesaId).in('estado', ['pendiente', 'en_preparacion', 'listo', 'entregado'])
    await supabase.from('mesas').update({ estado: 'libre' }).eq('id', mesaId)
    onCobrado()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(28,10,0,0.6)' }} onClick={onCerrar}>
      <div className="w-full sm:max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale" style={{ background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Cuenta</p>
            <h3 className="font-serif font-bold text-xl" style={{ color: 'var(--espresso)' }}>Mesa {mesaNumero}</h3>
          </div>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Cuenta */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {loading ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando cuenta...</p>
          ) : cuenta.items.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Esta mesa no tiene consumos por cobrar.</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {cuenta.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--espresso)' }}>
                      <span className="font-bold tabular-nums">{it.cantidad}×</span> {it.nombre}
                    </span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(it.cantidad * it.precio_unitario)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '2px dashed var(--border)' }}>
                <span className="font-bold" style={{ color: 'var(--espresso)' }}>Total</span>
                <span className="font-serif text-3xl font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(cuenta.total)}</span>
              </div>

              {/* Método de pago */}
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {METODOS.map((m) => (
                    <button key={m.value} onClick={() => setMetodo(m.value)} className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      style={metodo === m.value ? { background: 'var(--espresso)', color: '#FEF8F0' } : { background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{m.icon}</svg>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm font-medium px-3 py-2 rounded-lg mt-4" style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-5 space-y-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {cuenta.items.length > 0 && (
            <button onClick={cobrar} disabled={procesando} className="w-full py-3.5 rounded-xl font-bold text-base cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: '#16A34A', color: '#F0FDF4', boxShadow: 'var(--shadow-md)' }}>
              {procesando ? 'Procesando...' : `Cobrar ${formatMoney(cuenta.total)}`}
            </button>
          )}
          <button onClick={liberarSinCobrar} disabled={procesando} className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-colors disabled:opacity-50" style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            Liberar sin cobrar
          </button>
        </div>
      </div>
    </div>
  )
}
