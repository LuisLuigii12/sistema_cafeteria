import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { precioUnitario, buildNotas } from '@/lib/opciones'
import type { Orden, OrdenItem, Producto, Variante, Extra } from '@/types'

export type ItemEnEdicion = { orden: Orden; item: OrdenItem; producto: Producto }

/**
 * Lógica compartida para corregir órdenes ya enviadas (cambiar cantidad, editar
 * tamaño/extras, quitar un producto). La usan el banner de la mesa y la ventana
 * "Ver orden". Cada componente refresca sus datos por realtime.
 */
export function useOrdenEdicion() {
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [editando, setEditando] = useState<ItemEnEdicion | null>(null)

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

  return { trabajando, editando, setEditando, cambiarCantidad, quitar, guardarEdicion }
}
