'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { precioUnitario, buildNotas, parseNotas } from '@/lib/opciones'
import OpcionesModal from '@/components/mesa/OpcionesModal'
import type { Orden, OrdenItem, Producto, Variante, Extra } from '@/types'

interface Props {
  ordenes: Orden[]
  productos: Producto[]
}

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  pendiente:      { label: 'Pendiente',  color: '#C9A96E' },
  en_preparacion: { label: 'Preparando', color: '#F59E0B' },
  listo:          { label: 'Listo',      color: '#22C55E' },
}

export default function ActiveOrdersBanner({ ordenes, productos }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [editando, setEditando] = useState<{ orden: Orden; item: OrdenItem; producto: Producto } | null>(null)

  const productoDe = (item: OrdenItem) => productos.find((p) => p.id === item.producto_id)

  /** Total de una orden recalculado tras un cambio en uno de sus items. */
  function recalcularTotal(
    orden: Orden,
    cambio: { itemId: string; precio_unitario?: number; cantidad?: number; eliminar?: boolean },
  ): number {
    return (orden.orden_items ?? []).reduce((sum, it) => {
      if (it.id === cambio.itemId) {
        if (cambio.eliminar) return sum
        const pu = cambio.precio_unitario ?? Number(it.precio_unitario)
        const qty = cambio.cantidad ?? it.cantidad
        return sum + pu * qty
      }
      return sum + Number(it.precio_unitario) * it.cantidad
    }, 0)
  }

  async function entregar(id: string) {
    setTrabajando(id)
    await supabase.from('ordenes').update({ estado: 'entregado' }).eq('id', id)
    setTrabajando(null)
  }

  async function cambiarCantidad(orden: Orden, item: OrdenItem, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) return quitar(orden, item)
    setTrabajando(item.id)
    const total = recalcularTotal(orden, { itemId: item.id, cantidad: nuevaCantidad })
    await supabase.from('orden_items').update({ cantidad: nuevaCantidad }).eq('id', item.id)
    await supabase.from('ordenes').update({ total, updated_at: new Date().toISOString() }).eq('id', orden.id)
    setTrabajando(null)
  }

  async function quitar(orden: Orden, item: OrdenItem) {
    setTrabajando(item.id)
    await supabase.from('orden_items').delete().eq('id', item.id)
    const quedan = (orden.orden_items ?? []).filter((i) => i.id !== item.id)
    if (quedan.length === 0) {
      // Era el último producto: la orden ya no tiene sentido, se cancela.
      await supabase.from('ordenes').update({ estado: 'cancelado', updated_at: new Date().toISOString() }).eq('id', orden.id)
      // ¿A la mesa le queda algo POR COBRAR? (incluye lo ya entregado pero no pagado).
      // Si no queda nada que cobrar, se libera la mesa para que no siga mostrando "Cobrar".
      const { data: porCobrar, error: errCobrar } = await supabase
        .from('ordenes')
        .select('id')
        .eq('mesa_id', orden.mesa_id)
        .eq('pagado', false)
        .in('estado', ['pendiente', 'en_preparacion', 'listo', 'entregado'])
      if (!errCobrar && porCobrar && porCobrar.length === 0) {
        await supabase.from('mesas').update({ estado: 'libre' }).eq('id', orden.mesa_id)
      }
    } else {
      const total = recalcularTotal(orden, { itemId: item.id, eliminar: true })
      await supabase.from('ordenes').update({ total, updated_at: new Date().toISOString() }).eq('id', orden.id)
    }
    setTrabajando(null)
  }

  async function guardarEdicion(orden: Orden, item: OrdenItem, producto: Producto, variante: Variante | null, extras: Extra[]) {
    setTrabajando(item.id)
    const pu = precioUnitario(producto, variante, extras)
    const total = recalcularTotal(orden, { itemId: item.id, precio_unitario: pu })
    await supabase.from('orden_items').update({ precio_unitario: pu, notas: buildNotas(variante, extras) }).eq('id', item.id)
    await supabase.from('ordenes').update({ total, updated_at: new Date().toISOString() }).eq('id', orden.id)
    setEditando(null)
    setTrabajando(null)
  }

  if (ordenes.length === 0) return null

  const totalItems = ordenes.reduce((s, o) => s + (o.orden_items?.reduce((ss, i) => ss + i.cantidad, 0) ?? 0), 0)

  return (
    <div style={{ background: '#1C0A00', borderBottom: '1px solid rgba(201,169,110,0.3)' }}>
      {/* Toggle bar */}
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
          <span style={{ color: '#C9A96E', fontSize: '0.75rem', fontWeight: 600 }}>
            {ordenes.length} {ordenes.length === 1 ? 'orden activa' : 'órdenes activas'} · {totalItems} productos
          </span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"
          style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Detalle expandido */}
      {abierto && (
        <div className="px-4 pb-3 space-y-2">
          {ordenes.map((orden) => {
            const est = ESTADO_LABEL[orden.estado] ?? { label: orden.estado, color: '#888' }
            const items = orden.orden_items ?? []
            return (
              <div key={orden.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: 'rgba(254,248,240,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {orden.destino === 'cafeteria' ? 'Cafetería' : 'Cocina'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${est.color}20`, color: est.color }}>
                    {est.label}
                  </span>
                </div>

                {/* Productos editables uno por uno */}
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const prod = productoDe(item)
                    const tieneVariantes = (prod?.variantes ?? []).length > 0
                    const ocupado = trabajando === item.id
                    return (
                      <div key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.04)', opacity: ocupado ? 0.5 : 1 }}>
                        {/* Stepper cantidad */}
                        <div className="inline-flex items-center rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(201,169,110,0.3)' }}>
                          <button onClick={() => cambiarCantidad(orden, item, item.cantidad - 1)} disabled={ocupado} className="w-7 h-7 flex items-center justify-center text-lg leading-none cursor-pointer disabled:cursor-not-allowed" style={{ color: '#FEF8F0' }}>−</button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums" style={{ color: '#FEF8F0' }}>{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(orden, item, item.cantidad + 1)} disabled={ocupado} className="w-7 h-7 flex items-center justify-center text-lg leading-none cursor-pointer disabled:cursor-not-allowed" style={{ color: '#FEF8F0' }}>+</button>
                        </div>

                        {/* Nombre + tamaño/extras */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#FEF8F0' }}>{item.productos?.nombre}</p>
                          {item.notas && <p className="text-xs leading-tight truncate" style={{ color: '#C9A96E' }}>{item.notas}</p>}
                        </div>

                        {/* Acciones */}
                        {tieneVariantes && prod && (
                          <button
                            onClick={() => setEditando({ orden, item, producto: prod })}
                            disabled={ocupado}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
                            style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.4)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            Cambiar
                          </button>
                        )}
                        <button
                          onClick={() => quitar(orden, item)}
                          disabled={ocupado}
                          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer flex-shrink-0 disabled:cursor-not-allowed active:scale-90"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' }}
                          aria-label={`Quitar ${item.productos?.nombre}`}
                          title="Quitar este producto"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>

                {orden.estado === 'listo' && (
                  <button
                    onClick={() => entregar(orden.id)}
                    disabled={trabajando === orden.id}
                    className="mt-2 w-full py-2 rounded-lg text-xs font-bold cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ background: '#16A34A', color: '#F0FDF4' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {trabajando === orden.id ? 'Entregando...' : 'Marcar entregado'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal para corregir tamaño/extras de un producto ya enviado */}
      {editando && (() => {
        const { variante, extras } = parseNotas(editando.item.notas, editando.producto.variantes)
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
    </div>
  )
}
