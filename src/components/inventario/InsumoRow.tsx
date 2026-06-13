'use client'

import { formatMoney } from '@/lib/format'
import type { Insumo } from '@/types'

interface Props {
  insumo: Insumo
  index: number
  onAjustar: (id: string, delta: number) => void
  onEditar: (insumo: Insumo) => void
}

function nivelStock(i: Insumo) {
  if (i.stock <= 0) return { label: 'Agotado', color: '#EF4444', bg: '#FEE2E2' }
  if (i.stock <= i.stock_minimo) return { label: 'Stock bajo', color: '#B45309', bg: '#FEF3C7' }
  return { label: 'En existencia', color: '#15803D', bg: '#DCFCE7' }
}

export default function InsumoRow({ insumo, index, onAjustar, onEditar }: Props) {
  const nivel = nivelStock(insumo)
  const valor = insumo.costo * insumo.stock
  const barra = Math.min(100, Math.round((insumo.stock / Math.max(1, insumo.stock_minimo * 4)) * 100))

  return (
    <div
      className="rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4 animate-in"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', animationDelay: `${Math.min(index * 25, 250)}ms` }}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-3 min-w-0" style={{ flex: '1 1 180px' }}>
        <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--espresso)' }}>{insumo.nombre}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Costo {formatMoney(insumo.costo)} / {insumo.unidad}</p>
        </div>
      </div>

      {/* Stock + stepper */}
      <div style={{ flex: '1 1 200px' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: nivel.bg, color: nivel.color }}>{nivel.label}</span>
          <div className="flex items-center rounded-full overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button onClick={() => onAjustar(insumo.id, -1)} className="w-8 h-8 flex items-center justify-center text-lg cursor-pointer transition-colors hover:bg-[var(--gold-soft)]" style={{ color: 'var(--espresso)' }} aria-label="Restar">−</button>
            <span className="px-2 min-w-12 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{insumo.stock} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{insumo.unidad}</span></span>
            <button onClick={() => onAjustar(insumo.id, 1)} className="w-8 h-8 flex items-center justify-center text-lg cursor-pointer transition-colors hover:bg-[var(--gold-soft)]" style={{ color: 'var(--espresso)' }} aria-label="Sumar">+</button>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-soft)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${barra}%`, background: nivel.color }} />
        </div>
        <p className="text-[0.68rem] mt-1" style={{ color: 'var(--text-muted)' }}>Mínimo: {insumo.stock_minimo} {insumo.unidad}</p>
      </div>

      {/* Valor */}
      <div className="text-right" style={{ flex: '0 1 auto' }}>
        <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(valor)}</p>
        <p className="text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>en inventario</p>
      </div>

      {/* Edit */}
      <button
        onClick={() => onEditar(insumo)}
        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--gold-soft)] ml-auto"
        style={{ border: '1px solid var(--border)', color: 'var(--brown)' }}
        aria-label="Editar insumo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  )
}
