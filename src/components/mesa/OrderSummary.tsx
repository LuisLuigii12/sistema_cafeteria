'use client'

import { useState } from 'react'
import { notasRapidas, notaActiva, alternarNota } from '@/lib/quick-notes'
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
  const [confirmando, setConfirmando] = useState(false)

  const total = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0)

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'var(--gold-soft)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--espresso)' }}>
            La orden está vacía
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Toca un producto del menú para agregarlo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-soft)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
        </span>
        <button
          onClick={onLimpiar}
          className="text-xs font-semibold cursor-pointer transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-50"
          style={{ color: 'var(--red)' }}
        >
          Limpiar
        </button>
      </div>

      {/* Scrollable items — min-h-0 lets this region shrink so the footer stays pinned */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 space-y-2.5">
        {carrito.map((item, i) => (
          <div
            key={item.producto.id}
            className="rounded-xl p-3 animate-in"
            style={{
              background: 'var(--bg-card-soft)',
              border: '1px solid var(--border)',
              animationDelay: `${Math.min(i * 30, 200)}ms`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold flex-1 leading-tight" style={{ color: 'var(--espresso)' }}>
                {item.producto.nombre}
              </p>
              <p className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--espresso)' }}>
                ${(item.producto.precio * item.cantidad).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2.5">
              {/* Compact stepper */}
              <div
                className="flex items-center rounded-full overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              >
                <button
                  onClick={() => onActualizar(item.producto.id, item.cantidad - 1)}
                  className="w-9 h-9 flex items-center justify-center text-lg leading-none cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
                  style={{ color: 'var(--espresso)' }}
                  aria-label="Quitar uno"
                >
                  −
                </button>
                <span className="w-7 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onActualizar(item.producto.id, item.cantidad + 1)}
                  className="w-9 h-9 flex items-center justify-center text-lg leading-none cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
                  style={{ color: 'var(--espresso)' }}
                  aria-label="Agregar uno"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setNotaEditando(notaEditando === item.producto.id ? null : item.producto.id)}
                className="flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors duration-200 px-2 py-1.5 rounded-lg hover:bg-[var(--gold-soft)]"
                style={{ color: 'var(--brown)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                {item.notas ? 'Editar' : 'Nota'}
              </button>
            </div>

            {notaEditando === item.producto.id && (
              <div className="mt-2.5 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {notasRapidas(item.producto).map((chip) => {
                    const activo = notaActiva(item.notas, chip)
                    return (
                      <button
                        key={chip}
                        onClick={() => onActualizarNota(item.producto.id, alternarNota(item.notas, chip))}
                        className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all active:scale-95"
                        style={activo
                          ? { background: 'var(--gold)', color: 'var(--espresso)' }
                          : { background: 'var(--bg-card)', color: 'var(--brown)', border: '1px solid var(--border)' }}
                      >
                        {chip}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Otra indicación..."
                  value={item.notas}
                  onChange={(e) => onActualizarNota(item.producto.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setNotaEditando(null) }}
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none transition-shadow focus:ring-2"
                  style={{ border: '1px solid var(--gold)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
                />
                <button
                  onClick={() => setNotaEditando(null)}
                  className="text-xs font-semibold cursor-pointer"
                  style={{ color: 'var(--brown)' }}
                >
                  Listo
                </button>
              </div>
            )}
            {item.notas && notaEditando !== item.producto.id && (
              <div
                className="mt-2 flex items-start gap-1.5 text-xs rounded-lg px-2.5 py-1.5"
                style={{ color: 'var(--brown)', background: 'var(--gold-soft)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                <span className="leading-snug">{item.notas}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer — outside the scroll area, always visible */}
      <div
        className="p-4 space-y-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Total</span>
          <span className="font-serif text-2xl font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
            ${total.toFixed(2)}
          </span>
        </div>
        {confirmando && !enviando ? (
          <div className="space-y-2">
            <p className="text-xs text-center font-medium" style={{ color: 'var(--text-muted)' }}>¿Confirmar envío?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmando(false)}
                className="py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmando(false); onEnviar() }}
                className="py-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:brightness-110 active:scale-[0.99]"
                style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
              >
                Sí, enviar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmando(true)}
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
        )}
      </div>
    </div>
  )
}
