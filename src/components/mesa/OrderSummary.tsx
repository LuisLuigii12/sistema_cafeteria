'use client'

import { formatMoney } from '@/lib/format'
import type { ItemCarrito } from '@/types'

interface Props {
  carrito: ItemCarrito[]
  mesaNumero: number
  enviando: boolean
  onActualizar: (carritoKey: string, cantidad: number) => void
  onEnviar: () => void
  onLimpiar: () => void
}

export default function OrderSummary({
  carrito,
  mesaNumero,
  enviando,
  onActualizar,
  onEnviar,
  onLimpiar,
}: Props) {
  function precioItem(item: ItemCarrito) {
    const base = item.variante?.precio ?? item.producto.precio
    return base + item.extras.reduce((s, e) => s + e.precio, 0)
  }

  const total = carrito.reduce((sum, item) => sum + precioItem(item) * item.cantidad, 0)
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0)

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-soft)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--espresso)' }}>La orden está vacía</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Toca un producto del menú para agregarlo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
        </span>
        <button
          onClick={onLimpiar}
          className="text-xs font-semibold cursor-pointer transition-colors px-2 py-1 rounded-md hover:bg-red-50"
          style={{ color: 'var(--red)' }}
        >
          Limpiar
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2.5 space-y-2">
        {carrito.map((item, i) => (
          <div
            key={item.carritoKey}
            className="rounded-xl p-3 animate-in"
            style={{
              background: 'var(--bg-card-soft)',
              border: '1px solid var(--border)',
              animationDelay: `${Math.min(i * 30, 200)}ms`,
            }}
          >
            {/* Fila principal: stepper + nombre + precio */}
            <div className="flex items-start gap-2">
              {/* Stepper */}
              <div className="inline-flex items-center rounded-lg overflow-hidden flex-shrink-0 mt-0.5" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <button
                  onClick={() => onActualizar(item.carritoKey, item.cantidad - 1)}
                  className="w-8 h-8 flex items-center justify-center text-lg leading-none cursor-pointer hover:bg-[var(--gold-soft)]"
                  style={{ color: 'var(--espresso)' }}
                >−</button>
                <span className="w-6 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{item.cantidad}</span>
                <button
                  onClick={() => onActualizar(item.carritoKey, item.cantidad + 1)}
                  className="w-8 h-8 flex items-center justify-center text-lg leading-none cursor-pointer hover:bg-[var(--gold-soft)]"
                  style={{ color: 'var(--espresso)' }}
                >+</button>
              </div>

              {/* Nombre + variante */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--espresso)' }}>{item.producto.nombre}</p>
                {item.variante && (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--gold)' }}>{item.variante.nombre}</p>
                )}
              </div>

              {/* Precio + botón para quitar el artículo */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <p className="text-sm font-bold tabular-nums whitespace-nowrap" style={{ color: 'var(--espresso)' }}>
                  {formatMoney(precioItem(item) * item.cantidad)}
                </p>
                <button
                  onClick={() => onActualizar(item.carritoKey, 0)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-transform active:scale-90"
                  style={{ background: 'var(--red-soft)', color: 'var(--red)' }}
                  aria-label={`Quitar ${item.producto.nombre}`}
                  title="Quitar este artículo"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Extras seleccionados */}
            {item.extras.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 pl-10">
                {item.extras.map(extra => (
                  <span
                    key={extra.nombre}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--gold-soft)', color: 'var(--brown)', border: '1px solid var(--gold)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {extra.nombre}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>+{formatMoney(extra.precio)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Total</span>
          <span className="font-serif text-2xl font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
            {formatMoney(total)}
          </span>
        </div>
        <button
          onClick={onEnviar}
          disabled={enviando}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99]"
          style={{
            background: enviando ? 'var(--border)' : 'var(--espresso)',
            color: enviando ? 'var(--text-muted)' : '#FEF8F0',
            boxShadow: enviando ? 'none' : 'var(--shadow-md)',
          }}
        >
          {enviando ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              Enviar orden · Mesa {mesaNumero}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
