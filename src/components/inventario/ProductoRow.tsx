'use client'

import { temaCategoria, CategoriaIcon } from '@/components/shared/categoria'
import { formatMoney, formatPercent } from '@/lib/format'
import type { Producto } from '@/types'

interface Props {
  producto: Producto
  index: number
  onAjustar: (id: string, delta: number) => void
  onEditar: (producto: Producto) => void
  onToggleDisponible: (producto: Producto) => void
}

function nivelStock(p: Producto) {
  if (p.stock <= 0) return { label: 'Agotado', color: '#EF4444', bg: '#FEE2E2' }
  if (p.stock <= p.stock_minimo) return { label: 'Stock bajo', color: '#B45309', bg: '#FEF3C7' }
  return { label: 'Disponible', color: '#15803D', bg: '#DCFCE7' }
}

export default function ProductoRow({ producto, index, onAjustar, onEditar, onToggleDisponible }: Props) {
  const tema = temaCategoria(producto.categorias?.nombre)
  const nivel = nivelStock(producto)
  const margen = producto.precio - producto.costo
  const margenPct = producto.precio > 0 ? margen / producto.precio : 0
  const barra = Math.min(100, Math.round((producto.stock / Math.max(1, producto.stock_minimo * 4)) * 100))

  return (
    <div
      className="rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4 animate-in"
      style={{
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-sm)',
        opacity: producto.disponible ? 1 : 0.6,
        animationDelay: `${Math.min(index * 25, 250)}ms`,
      }}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-3 min-w-0" style={{ flex: '1 1 180px' }}>
        <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tema.soft, color: tema.color }}>
          <CategoriaIcon categoria={producto.categorias?.nombre} size={22} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--espresso)' }}>{producto.nombre}</p>
          <p className="text-xs" style={{ color: tema.color }}>{producto.categorias?.nombre ?? 'Sin categoría'}</p>
        </div>
      </div>

      {/* Stock + stepper */}
      <div style={{ flex: '1 1 200px' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: nivel.bg, color: nivel.color }}>
            {nivel.label}
          </span>
          <div className="flex items-center rounded-full overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button
              onClick={() => onAjustar(producto.id, -1)}
              className="w-8 h-8 flex items-center justify-center text-lg cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
              style={{ color: 'var(--espresso)' }}
              aria-label="Restar uno"
            >−</button>
            <span className="w-10 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{producto.stock}</span>
            <button
              onClick={() => onAjustar(producto.id, 1)}
              className="w-8 h-8 flex items-center justify-center text-lg cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
              style={{ color: 'var(--espresso)' }}
              aria-label="Sumar uno"
            >+</button>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-soft)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${barra}%`, background: nivel.color }} />
        </div>
        <p className="text-[0.68rem] mt-1" style={{ color: 'var(--text-muted)' }}>Mínimo: {producto.stock_minimo}</p>
      </div>

      {/* Precio / costo / margen */}
      <div className="flex items-center gap-4 sm:gap-6" style={{ flex: '0 1 auto' }}>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(producto.precio)}</p>
          <p className="text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>Costo {formatMoney(producto.costo)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums" style={{ color: margen >= 0 ? '#15803D' : '#EF4444' }}>{formatMoney(margen)}</p>
          <p className="text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>Ganas {formatPercent(margenPct)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => onToggleDisponible(producto)}
          className="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          style={producto.disponible
            ? { background: 'var(--green-soft)', color: 'var(--green-text)' }
            : { background: '#F0EBE5', color: 'var(--text-muted)' }}
          title={producto.disponible ? 'Visible en el menú' : 'Oculto del menú'}
        >
          {producto.disponible ? 'En menú' : 'Oculto'}
        </button>
        <button
          onClick={() => onEditar(producto)}
          className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
          style={{ border: '1px solid var(--border)', color: 'var(--brown)' }}
          aria-label="Editar producto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
