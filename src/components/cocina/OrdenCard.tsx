'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Orden, EstadoOrden } from '@/types'

interface Props {
  orden: Orden
  ahora?: Date
}

const ESTADO_SIGUIENTE: Partial<Record<EstadoOrden, EstadoOrden>> = {
  pendiente: 'en_preparacion',
  en_preparacion: 'listo',
  listo: 'entregado',
}

function calcMinutos(fechaStr: string, ahora: Date) {
  return Math.max(0, Math.floor((ahora.getTime() - new Date(fechaStr).getTime()) / 60000))
}

function formatTiempo(mins: number) {
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} m`
}

function urgenciaColor(mins: number) {
  if (mins < 5) return { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label: formatTiempo(mins) }
  if (mins < 10) return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: formatTiempo(mins) }
  return { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: `${formatTiempo(mins)} ⚠` }
}

export default function OrdenCard({ orden, ahora = new Date() }: Props) {
  const [cargando, setCargando] = useState(false)
  const siguienteEstado = ESTADO_SIGUIENTE[orden.estado]
  const mins = calcMinutos(orden.created_at, ahora)
  const urgencia = urgenciaColor(mins)

  async function avanzarEstado() {
    if (!siguienteEstado) return
    setCargando(true)
    try {
      await supabase.from('ordenes').update({ estado: siguienteEstado }).eq('id', orden.id)

      if (siguienteEstado === 'entregado' && orden.mesa_id) {
        // Si no quedan órdenes activas para esta mesa, liberarla (a menos que ya esté por_pagar)
        const { data: pendientes } = await supabase
          .from('ordenes')
          .select('id')
          .eq('mesa_id', orden.mesa_id)
          .in('estado', ['pendiente', 'en_preparacion', 'listo'])
          .neq('id', orden.id)
        if (!pendientes || pendientes.length === 0) {
          const { data: mesa } = await supabase.from('mesas').select('estado').eq('id', orden.mesa_id).single()
          if (mesa && mesa.estado !== 'por_pagar') {
            await supabase.from('mesas').update({ estado: 'libre' }).eq('id', orden.mesa_id)
          }
        }
      }
    } finally {
      setCargando(false)
    }
  }

  const totalItems = orden.orden_items?.reduce((s, i) => s + i.cantidad, 0) ?? 0

  const accentColor =
    orden.estado === 'pendiente' ? '#C9A96E' :
    orden.estado === 'en_preparacion' ? '#F59E0B' : '#22C55E'

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col animate-scale"
      style={{
        background: '#1E0C02',
        border: `2px solid ${accentColor}`,
        boxShadow: `0 4px 20px ${accentColor}20`,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: accentColor }} />

      {/* Card content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p style={{ color: accentColor, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
              Mesa
            </p>
            <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
              {orden.mesas?.numero}
            </h3>
          </div>
          <div className="text-right">
            {/* Time badge */}
            <span
              className="inline-block px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background: urgencia.bg, color: urgencia.color }}
            >
              {urgencia.label}
            </span>
            <p style={{ color: 'rgba(254,248,240,0.4)', fontSize: '0.65rem', marginTop: 4 }}>
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `${accentColor}30` }} />

        {/* Items list */}
        <ul className="space-y-2">
          {orden.orden_items?.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                {item.cantidad}
              </span>
              <div className="flex-1 min-w-0">
                <p style={{ color: '#FEF8F0', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.3 }}>
                  {item.productos?.nombre}
                </p>
                {item.notas && (
                  <p style={{ color: '#C9A96E', fontSize: '0.72rem', marginTop: 2, fontStyle: 'italic' }}>
                    ↳ {item.notas}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Action button */}
        {siguienteEstado && (
          <button
            onClick={avanzarEstado}
            disabled={cargando}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 hover:opacity-90 mt-1"
            style={
              siguienteEstado === 'en_preparacion'
                ? { background: '#C9A96E', color: '#1C0A00' }
                : siguienteEstado === 'listo'
                ? { background: '#16A34A', color: '#F0FDF4' }
                : { background: '#2563EB', color: '#EFF6FF' }
            }
          >
            {cargando
              ? 'Actualizando...'
              : siguienteEstado === 'en_preparacion'
              ? 'Iniciar preparación'
              : siguienteEstado === 'listo'
              ? '✓ Marcar listo'
              : '↑ Entregar a mesa'}
          </button>
        )}
      </div>
    </div>
  )
}
