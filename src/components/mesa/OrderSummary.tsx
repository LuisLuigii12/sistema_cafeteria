'use client'

import { useState } from 'react'
import type { ItemCarrito } from '@/types'

interface Props {
  carrito: ItemCarrito[]
  mesaNumero: number
  enviando: boolean
  onActualizar: (productoId: string, cantidad: number) => void
  onActualizarNota: (productoId: string, nota: string) => void
  onEnviar: () => void
  onLimpiar: () => void
}

export default function OrderSummary({
  carrito,
  mesaNumero,
  enviando,
  onActualizar,
  onActualizarNota,
  onEnviar,
  onLimpiar,
}: Props) {
  const [notaEditando, setNotaEditando] = useState<string | null>(null)

  const total = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0)

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Selecciona productos para agregar a la orden
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
        </span>
        <button
          onClick={onLimpiar}
          className="text-xs font-medium cursor-pointer transition-colors duration-200"
          style={{ color: '#C62828' }}
        >
          Limpiar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {carrito.map((item) => (
          <div key={item.producto.id} className="rounded-xl p-3" style={{ background: 'var(--bg-cream)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold flex-1 leading-tight" style={{ color: 'var(--espresso)' }}>
                {item.producto.nombre}
              </p>
              <p className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--brown)' }}>
                ${(item.producto.precio * item.cantidad).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onActualizar(item.producto.id, item.cantidad - 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px]"
                  style={{ background: '#FFFFFF', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--espresso)' }}>{item.cantidad}</span>
                <button
                  onClick={() => onActualizar(item.producto.id, item.cantidad + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px]"
                  style={{ background: '#FFFFFF', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setNotaEditando(notaEditando === item.producto.id ? null : item.producto.id)}
                className="text-xs cursor-pointer transition-colors duration-200"
                style={{ color: 'var(--gold)' }}
              >
                {item.notas ? 'Editar nota' : '+ Nota'}
              </button>
            </div>

            {notaEditando === item.producto.id && (
              <input
                autoFocus
                type="text"
                placeholder="Ej: sin azúcar, término medio..."
                value={item.notas}
                onChange={(e) => onActualizarNota(item.producto.id, e.target.value)}
                onBlur={() => setNotaEditando(null)}
                className="mt-2 w-full text-xs rounded-lg px-3 py-2 outline-none"
                style={{ border: '1px solid var(--gold)', background: '#FFFFFF', color: 'var(--espresso)' }}
              />
            )}
            {item.notas && notaEditando !== item.producto.id && (
              <p className="mt-1 text-xs rounded px-2 py-1" style={{ color: 'var(--brown)', background: '#FEF3E2' }}>
                ✎ {item.notas}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Total</span>
          <span className="font-serif text-2xl font-semibold" style={{ color: 'var(--espresso)' }}>${total.toFixed(2)}</span>
        </div>
        <button
          onClick={onEnviar}
          disabled={enviando}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
          style={{
            background: enviando ? 'var(--border)' : 'var(--espresso)',
            color: enviando ? 'var(--text-muted)' : '#FEF8F0',
          }}
        >
          {enviando ? 'Enviando orden...' : `Enviar a Cocina — Mesa ${mesaNumero}`}
        </button>
      </div>
    </div>
  )
}
