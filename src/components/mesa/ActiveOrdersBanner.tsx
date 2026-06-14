'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Orden } from '@/types'

interface Props {
  ordenes: Orden[]
}

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  pendiente:      { label: 'Pendiente',      color: '#C9A96E' },
  en_preparacion: { label: 'Preparando',     color: '#F59E0B' },
  listo:          { label: 'Listo',          color: '#22C55E' },
}

export default function ActiveOrdersBanner({ ordenes }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [entregando, setEntregando] = useState<string | null>(null)

  async function entregar(id: string) {
    setEntregando(id)
    await supabase.from('ordenes').update({ estado: 'entregado' }).eq('id', id)
    setEntregando(null)
  }

  if (ordenes.length === 0) return null

  const totalItems = ordenes.reduce((s, o) => s + (o.orden_items?.reduce((ss, i) => ss + i.cantidad, 0) ?? 0), 0)

  return (
    <div style={{ background: '#1C0A00', borderBottom: '1px solid rgba(201,169,110,0.3)' }}>
      {/* Toggle bar */}
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
          <span style={{ color: '#C9A96E', fontSize: '0.75rem', fontWeight: 600 }}>
            {ordenes.length} {ordenes.length === 1 ? 'orden activa' : 'órdenes activas'} · {totalItems} productos
          </span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"
          style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded detail */}
      {abierto && (
        <div className="px-4 pb-3 space-y-2">
          {ordenes.map(orden => {
            const est = ESTADO_LABEL[orden.estado] ?? { label: orden.estado, color: '#888' }
            const items = orden.orden_items ?? []
            return (
              <div
                key={orden.id}
                className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: 'rgba(254,248,240,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {orden.destino === 'cafeteria' ? 'Cafetería' : 'Cocina'}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${est.color}20`, color: est.color }}
                  >
                    {est.label}
                  </span>
                </div>
                <p style={{ color: '#FEF8F0', fontSize: '0.8rem' }}>
                  {items.map(i => `${i.cantidad}× ${i.productos?.nombre}`).join(', ')}
                </p>
                {orden.estado === 'listo' && (
                  <button
                    onClick={() => entregar(orden.id)}
                    disabled={entregando === orden.id}
                    className="mt-2 w-full py-2 rounded-lg text-xs font-bold cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ background: '#16A34A', color: '#F0FDF4' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {entregando === orden.id ? 'Entregando...' : 'Marcar entregado'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
