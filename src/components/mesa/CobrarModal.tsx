'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney } from '@/lib/format'
import type { Orden, OrdenItem, TicketItem } from '@/types'

const COLORES = ['#C9A96E', '#7C3AED', '#059669', '#DC2626', '#2563EB', '#D97706', '#0891B2', '#BE185D']

interface Props {
  mesaId: string
  mesaNumero: number
  onCobrado: () => void
  onCerrar: () => void
}

interface ItemFlat extends OrdenItem {
  nombreProducto: string
}

export default function CobrarModal({ mesaId, mesaNumero, onCobrado, onCerrar }: Props) {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vistaPersona, setVistaPersona] = useState(true)

  useEffect(() => {
    let activo = true
    ;(async () => {
      const { data } = await supabase
        .from('ordenes')
        .select('*, orden_items(*, productos(nombre))')
        .eq('mesa_id', mesaId)
        .in('estado', ['pendiente', 'en_preparacion', 'listo', 'entregado'])
        .order('created_at')
      const pendientes = (data ?? []).filter((o) => !o.pagado) as Orden[]
      if (activo) { setOrdenes(pendientes); setLoading(false) }
    })()
    return () => { activo = false }
  }, [mesaId])

  // Todos los items aplanados
  const todosLosItems = useMemo<ItemFlat[]>(() => {
    return ordenes.flatMap(o =>
      (o.orden_items ?? []).map(it => ({
        ...it,
        nombreProducto: it.productos?.nombre ?? 'Producto',
      }))
    )
  }, [ordenes])

  // ¿Hay cuenta dividida?
  const tieneSplit = useMemo(
    () => todosLosItems.some(it => it.comensal != null && it.comensal > 0),
    [todosLosItems]
  )

  // Cuenta combinada (vista normal)
  const cuentaCombinada = useMemo(() => {
    const mapa = new Map<string, TicketItem>()
    for (const it of todosLosItems) {
      const key = `${it.nombreProducto}__${it.precio_unitario}`
      const cur = mapa.get(key) ?? { nombre: it.nombreProducto, cantidad: 0, precio_unitario: Number(it.precio_unitario) }
      cur.cantidad += it.cantidad
      mapa.set(key, cur)
    }
    const items = [...mapa.values()]
    return { items, total: items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0) }
  }, [todosLosItems])

  // Cuenta por persona
  const cuentaPorPersona = useMemo(() => {
    const grupos = new Map<number, { items: TicketItem[]; total: number }>()
    for (const it of todosLosItems) {
      const n = (it.comensal != null && it.comensal > 0) ? it.comensal : 0
      if (!grupos.has(n)) grupos.set(n, { items: [], total: 0 })
      const g = grupos.get(n)!
      const key = `${it.nombreProducto}__${it.precio_unitario}`
      const existente = g.items.find(i => `${i.nombre}__${i.precio_unitario}` === key)
      if (existente) { existente.cantidad += it.cantidad }
      else g.items.push({ nombre: it.nombreProducto, cantidad: it.cantidad, precio_unitario: Number(it.precio_unitario) })
      g.total += it.cantidad * Number(it.precio_unitario)
    }
    // Ordenar: personas (1,2,3...) primero, sin asignar (0) al final
    return [...grupos.entries()].sort((a, b) => {
      if (a[0] === 0) return 1
      if (b[0] === 0) return -1
      return a[0] - b[0]
    })
  }, [todosLosItems])

  const total = cuentaCombinada.total

  async function cobrar() {
    setProcesando(true); setError(null)
    const { error: tErr } = await supabase.from('tickets').insert({
      mesa_numero: mesaNumero,
      total,
      items: cuentaCombinada.items,
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

  const mostrandoPorPersona = tieneSplit && vistaPersona

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(28,10,0,0.6)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale"
        style={{ background: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Cuenta</p>
            <h3 className="font-serif font-bold text-xl" style={{ color: 'var(--espresso)' }}>Mesa {mesaNumero}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle vista solo si hay split */}
            {tieneSplit && (
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setVistaPersona(true)}
                  className="px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                  style={vistaPersona
                    ? { background: 'var(--espresso)', color: '#FEF8F0' }
                    : { background: 'transparent', color: 'var(--text-muted)' }
                  }
                >
                  Por comensal
                </button>
                <button
                  onClick={() => setVistaPersona(false)}
                  className="px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                  style={!vistaPersona
                    ? { background: 'var(--espresso)', color: '#FEF8F0' }
                    : { background: 'transparent', color: 'var(--text-muted)' }
                  }
                >
                  Combinada
                </button>
              </div>
            )}
            <button
              onClick={onCerrar}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {loading ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando cuenta...</p>
          ) : cuentaCombinada.items.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Esta mesa no tiene consumos por cobrar.</p>
          ) : mostrandoPorPersona ? (
            // ── Vista por persona ──
            <div className="space-y-4">
              {cuentaPorPersona.map(([n, grupo]) => {
                const color = n === 0 ? '#94A3B8' : COLORES[(n - 1) % COLORES.length]
                const label = n === 0 ? 'Sin asignar' : `Comensal ${n}`
                return (
                  <div key={n} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${color}30` }}>
                    {/* Encabezado persona */}
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `${color}12` }}>
                      <div className="flex items-center gap-2">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--espresso)' }}>{label}</span>
                      </div>
                      <span className="text-base font-bold tabular-nums font-serif" style={{ color }}>
                        {formatMoney(grupo.total)}
                      </span>
                    </div>
                    {/* Items */}
                    <div className="px-4 py-3 space-y-2">
                      {grupo.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: 'var(--espresso)' }}>
                            <span className="font-bold tabular-nums">{it.cantidad}×</span> {it.nombre}
                          </span>
                          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                            {formatMoney(it.cantidad * it.precio_unitario)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // ── Vista combinada ──
            <div className="space-y-2">
              {cuentaCombinada.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--espresso)' }}>
                    <span className="font-bold tabular-nums">{it.cantidad}×</span> {it.nombre}
                  </span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--espresso)' }}>
                    {formatMoney(it.cantidad * it.precio_unitario)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm font-medium px-3 py-2 rounded-lg mt-4" style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        {!loading && cuentaCombinada.items.length > 0 && (
          <div className="p-5 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold" style={{ color: 'var(--espresso)' }}>Total</span>
              <span className="font-serif text-3xl font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
                {formatMoney(total)}
              </span>
            </div>
            <button
              onClick={cobrar}
              disabled={procesando}
              className="w-full py-3.5 rounded-xl font-bold text-base cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#16A34A', color: '#F0FDF4', boxShadow: 'var(--shadow-md)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {procesando ? 'Procesando...' : `Cobrar ${formatMoney(total)}`}
            </button>
            <button
              onClick={liberarSinCobrar}
              disabled={procesando}
              className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-colors disabled:opacity-50"
              style={{ background: 'transparent', color: 'var(--text-muted)' }}
            >
              Liberar sin cobrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
