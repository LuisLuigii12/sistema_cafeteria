'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney } from '@/lib/format'
import { parseNotas } from '@/lib/opciones'
import { useOrdenEdicion } from '@/lib/orden-edicion'
import OpcionesModal from '@/components/mesa/OpcionesModal'
import type { Orden, OrdenItem, Mesa, Producto, Variante } from '@/types'

const ESTADO: Record<string, { label: string; color: string }> = {
  pendiente:      { label: 'En preparación', color: '#C9A96E' },
  en_preparacion: { label: 'En preparación', color: '#F59E0B' },
  listo:          { label: 'Listo',          color: '#16A34A' },
}

interface Props {
  mesa: Mesa
  onCerrar: () => void
  onAgregar: () => void
  onCobrar: () => void
}

/** Vista de la orden de una mesa: ver lo ordenado y corregir/quitar (si aún no está listo). */
export default function VerOrdenModal({ mesa, onCerrar, onAgregar, onCobrar }: Props) {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const { trabajando, editando, setEditando, cambiarCantidad, quitar, guardarEdicion } = useOrdenEdicion()

  const productoDe = (item: OrdenItem) => productos.find((p) => p.id === item.producto_id)

  useEffect(() => {
    let activo = true
    async function fetchOrdenes() {
      const { data } = await supabase
        .from('ordenes')
        .select('*, orden_items(*, productos(nombre))')
        .eq('mesa_id', mesa.id)
        .eq('pagado', false)
        .in('estado', ['pendiente', 'en_preparacion', 'listo'])
        .order('created_at')
      if (activo) { setOrdenes((data ?? []) as unknown as Orden[]); setLoading(false) }
    }
    async function fetchProductos() {
      const [{ data: prod }, { data: vars }] = await Promise.all([
        supabase.from('productos').select('*'),
        supabase.from('variantes').select('*').order('orden'),
      ])
      if (activo && prod) {
        const variantes = (vars ?? []) as Variante[]
        setProductos((prod as Producto[]).map((p) => ({ ...p, variantes: variantes.filter((v) => v.producto_id === p.id) })))
      }
    }
    fetchOrdenes()
    fetchProductos()
    const ch = supabase
      .channel(`ver-orden-${mesa.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes', filter: `mesa_id=eq.${mesa.id}` }, fetchOrdenes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orden_items' }, fetchOrdenes)
      .subscribe()
    return () => { activo = false; supabase.removeChannel(ch) }
  }, [mesa.id])

  const total = ordenes.reduce(
    (s, o) => s + (o.orden_items ?? []).reduce((ss, it) => ss + it.cantidad * Number(it.precio_unitario), 0),
    0,
  )
  const cobrable = ordenes.some((o) => o.estado === 'listo')

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(28,10,0,0.6)' }} onClick={onCerrar}>
      <div className="w-full sm:max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale" style={{ background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Orden de la mesa</p>
            <h3 className="font-serif font-bold text-xl" style={{ color: 'var(--espresso)' }}>Mesa {mesa.numero}</h3>
          </div>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Productos */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {loading ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</p>
          ) : ordenes.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Esta mesa no tiene orden todavía.</p>
          ) : (
            ordenes.map((orden) => {
              const est = ESTADO[orden.estado] ?? { label: orden.estado, color: '#888' }
              const puedeEditar = orden.estado !== 'listo'
              return (
                <div key={orden.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      {orden.destino === 'cafeteria' ? 'Cafetería' : 'Cocina'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${est.color}1a`, color: est.color }}>{est.label}</span>
                  </div>
                  <div className="space-y-2">
                    {(orden.orden_items ?? []).map((it) => {
                      const prod = productoDe(it)
                      const tieneVariantes = (prod?.variantes ?? []).length > 0
                      const ocupado = trabajando === it.id
                      return (
                        <div key={it.id} className="flex items-center gap-2" style={{ opacity: ocupado ? 0.5 : 1 }}>
                          {puedeEditar ? (
                            <div className="inline-flex items-center rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                              <button onClick={() => cambiarCantidad(orden, it, it.cantidad - 1)} disabled={ocupado} className="w-7 h-7 flex items-center justify-center text-lg leading-none cursor-pointer disabled:opacity-40" style={{ color: 'var(--espresso)' }}>−</button>
                              <span className="w-6 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{it.cantidad}</span>
                              <button onClick={() => cambiarCantidad(orden, it, it.cantidad + 1)} disabled={ocupado} className="w-7 h-7 flex items-center justify-center text-lg leading-none cursor-pointer disabled:opacity-40" style={{ color: 'var(--espresso)' }}>+</button>
                            </div>
                          ) : (
                            <span className="flex-shrink-0 text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{it.cantidad}×</span>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--espresso)' }}>{it.productos?.nombre}</p>
                            {it.notas && <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{it.notas}</p>}
                          </div>

                          <span className="text-sm font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--espresso)' }}>{formatMoney(it.cantidad * Number(it.precio_unitario))}</span>

                          {puedeEditar && tieneVariantes && prod && (
                            <button
                              onClick={() => setEditando({ orden, item: it, producto: prod })}
                              disabled={ocupado}
                              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer flex-shrink-0 disabled:opacity-40"
                              style={{ background: 'var(--gold-soft)', color: 'var(--brown)', border: '1px solid var(--gold)' }}
                              title="Cambiar tamaño / extras"
                              aria-label="Cambiar"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            </button>
                          )}
                          {puedeEditar && (
                            <button
                              onClick={() => quitar(orden, it)}
                              disabled={ocupado}
                              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer flex-shrink-0 disabled:opacity-40 active:scale-90"
                              style={{ background: 'var(--red-soft)', color: 'var(--red)' }}
                              title="Quitar este producto"
                              aria-label={`Quitar ${it.productos?.nombre}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {orden.estado === 'listo' && (
                    <p className="text-[0.68rem] mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Ya preparado · no se puede cambiar
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Total + acciones */}
        {!loading && ordenes.length > 0 && (
          <div className="p-5 flex-shrink-0 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: 'var(--espresso)' }}>Total</span>
              <span className="font-serif text-2xl font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(total)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onAgregar}
                className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-1.5"
                style={{ background: 'var(--gold-soft)', color: 'var(--brown)', border: '1px solid var(--gold)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                Agregar productos
              </button>
              {cobrable && (
                <button
                  onClick={onCobrar}
                  className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-1.5"
                  style={{ background: '#16A34A', color: '#F0FDF4' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Cobrar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal para corregir tamaño/extras (fuera del overlay para no cerrar ambos) */}
      {editando && (() => {
        const { variante, extras } = parseNotas(editando.item.notas, editando.producto)
        return (
          <OpcionesModal
            producto={editando.producto}
            varianteInicial={variante}
            extrasIniciales={extras}
            modo="editar"
            onConfirmar={(v, e) => guardarEdicion(editando.orden, editando.item, editando.producto, v, e)}
            onCerrar={() => setEditando(null)}
          />
        )
      })()}
    </>
  )
}
