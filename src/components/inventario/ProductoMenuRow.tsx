/* eslint-disable @next/next/no-img-element */
'use client'

import { temaCategoria, CategoriaIcon } from '@/components/shared/categoria'
import { formatMoney } from '@/lib/format'
import type { Producto } from '@/types'

/** Renglón de la pestaña "Menú": editar cualquier producto (precio, receta, opciones…). */
export default function ProductoMenuRow({ producto, onEditar }: { producto: Producto; onEditar: (p: Producto) => void }) {
  const tema = temaCategoria(producto.categorias?.nombre)
  const tieneVariantes = (producto.variantes ?? []).length > 0
  const precioBase = (producto.variantes ?? [])[0]?.precio ?? producto.precio

  return (
    <button
      onClick={() => onEditar(producto)}
      className="w-full flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer text-left transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', opacity: producto.disponible ? 1 : 0.55 }}
    >
      <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: tema.soft, color: tema.color }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <CategoriaIcon categoria={producto.categorias?.nombre} size={22} />
        )}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--espresso)' }}>{producto.nombre}</p>
        <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {tieneVariantes ? 'desde ' : ''}{formatMoney(precioBase)}
          {!producto.disponible && <span style={{ color: 'var(--red)' }}> · Oculto del menú</span>}
        </p>
      </div>

      <span className="flex items-center gap-1 text-xs font-semibold flex-shrink-0" style={{ color: 'var(--gold)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        <span className="hidden sm:inline">Editar</span>
      </span>
    </button>
  )
}
