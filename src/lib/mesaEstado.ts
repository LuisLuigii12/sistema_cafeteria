import { supabase } from '@/lib/supabase'

/**
 * Recalcula el estado de una mesa según sus órdenes SIN pagar:
 *  - Sin órdenes vivas                                  → no toca nada (la libera cobro/quitar).
 *  - Algo por hacer o por recoger (pend./prep./listo)   → 'ocupada'.
 *  - Todo ya ENTREGADO al cliente                       → 'por_pagar' (falta cobrar).
 *
 * Se llama al marcar Listo (cocina/cafetería), al deshacer, y al marcar Entregado.
 */
export async function recalcularEstadoMesa(mesaId: string) {
  if (!mesaId) return
  const { data, error } = await supabase
    .from('ordenes')
    .select('estado')
    .eq('mesa_id', mesaId)
    .eq('pagado', false)
    .in('estado', ['pendiente', 'en_preparacion', 'listo', 'entregado'])
  if (error) return
  const vivas = data ?? []
  if (vivas.length === 0) return // no hay nada por cobrar; el estado 'libre' lo pone el flujo de cobro/quitar

  // 'listo' = la mesera todavía debe recogerlo/entregarlo, así que la mesa sigue "ocupada".
  // Solo cuando TODO está entregado al cliente, la mesa pasa a "por_pagar".
  const enProceso = vivas.some(
    (o) => o.estado === 'pendiente' || o.estado === 'en_preparacion' || o.estado === 'listo',
  )
  await supabase
    .from('mesas')
    .update({ estado: enProceso ? 'ocupada' : 'por_pagar' })
    .eq('id', mesaId)
}
