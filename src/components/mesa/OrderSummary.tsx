'use client'

import { formatMoney } from '@/lib/format'
import { precioUnitario } from '@/lib/opciones'
import type { ItemCarrito } from '@/types'

const COLORES_COMENSAL = ['#C9A96E', '#7C3AED', '#059669', '#DC2626', '#2563EB', '#D97706', '#0891B2', '#BE185D']

interface Props {
  carrito: ItemCarrito[]
  mesaNumero: number
  enviando: boolean
  onActualizar: (carritoKey: string, cantidad: number) => void
  onEnviar: () => void
  onLimpiar: () => void
  dividirCuenta: boolean
  comensalActivo: number
  totalComensales: number
  onToggleDividir: () => void
  onCambiarComensal: (n: number) => void
  onAgregarComensal: () => void
}

function precioItem(item: ItemCarrito) {
  return precioUnitario(item.producto, item.variante, item.extras)
}

function ItemRow({
  item,
  onActualizar,
  dotColor,
}: {
  item: ItemCarrito
  onActualizar: (key: string, n: number) => void
  dotColor?: string
}) {
  const precio = precioItem(item)
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'var(--bg-card-soft)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-2">
        {/* Stepper */}
        <div
          className="inline-flex items-center rounded-lg overflow-hidden flex-shrink-0 mt-0.5"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          <button
            onClick={() => onActualizar(item.carritoKey, item.cantidad - 1)}
            className="w-7 h-7 flex items-center justify-center text-lg leading-none cursor-pointer hover:bg-[var(--gold-soft)]"
            style={{ color: 'var(--espresso)' }}
          >−</button>
          <span className="w-5 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
            {item.cantidad}
          </span>
          <button
            onClick={() => onActualizar(item.carritoKey, item.cantidad + 1)}
            className="w-7 h-7 flex items-center justify-center text-lg leading-none cursor-pointer hover:bg-[var(--gold-soft)]"
            style={{ color: 'var(--espresso)' }}
          >+</button>
        </div>

        {/* Nombre + variante */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {dotColor && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
            )}
            <p className="text-sm font-bold leading-tight truncate" style={{ color: 'var(--espresso)' }}>
              {item.producto.nombre}
            </p>
          </div>
          {item.variante && (
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--gold)' }}>
              {item.variante.nombre}
            </p>
          )}
        </div>

        {/* Precio + eliminar */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
            {formatMoney(precio * item.cantidad)}
          </p>
          <button
            onClick={() => onActualizar(item.carritoKey, 0)}
            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-transform active:scale-90"
            style={{ background: 'var(--red-soft)', color: 'var(--red)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Extras */}
      {item.extras.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pl-9">
          {item.extras.map(e => (
            <span
              key={e.nombre}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--gold-soft)', color: 'var(--brown)', border: '1px solid var(--gold)' }}
            >
              {e.nombre}
              {e.precio > 0 && (
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>+{formatMoney(e.precio)}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrderSummary({
  carrito, mesaNumero, enviando,
  onActualizar, onEnviar, onLimpiar,
  dividirCuenta, comensalActivo, totalComensales,
  onToggleDividir, onCambiarComensal, onAgregarComensal,
}: Props) {
  const total = carrito.reduce((s, i) => s + precioItem(i) * i.cantidad, 0)
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

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

      {/* ── Sub-header ── */}
      <div className="px-4 py-2.5 flex-shrink-0 space-y-2" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        {/* Fila: artículos + botones */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
          </span>
          <div className="flex items-center gap-2">
            {/* Toggle dividir */}
            <button
              onClick={onToggleDividir}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
              style={dividirCuenta
                ? { background: 'var(--espresso)', color: '#FEF8F0' }
                : { background: 'var(--gold-soft)', color: 'var(--brown)', border: '1px solid var(--gold)' }
              }
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5M3 12h18"/>
              </svg>
              {dividirCuenta ? 'Dividida' : 'Dividir'}
            </button>

            <button
              onClick={onLimpiar}
              className="text-xs font-semibold cursor-pointer transition-colors px-2 py-1 rounded-md hover:bg-red-50"
              style={{ color: 'var(--red)' }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabs de comensales — solo en modo split */}
        {dividirCuenta && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {Array.from({ length: totalComensales }, (_, i) => i + 1).map(n => {
              const activo = comensalActivo === n
              const color = COLORES_COMENSAL[(n - 1) % COLORES_COMENSAL.length]
              return (
                <button
                  key={n}
                  onClick={() => onCambiarComensal(n)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all"
                  style={activo
                    ? { background: color, color: '#fff' }
                    : { background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: activo ? 'rgba(255,255,255,0.6)' : color,
                    display: 'inline-block',
                  }} />
                  {n}
                </button>
              )
            })}
            {totalComensales < 8 && (
              <button
                onClick={onAgregarComensal}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Items ── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2.5 space-y-2">
        {dividirCuenta ? (
          // Agrupado por persona
          Array.from({ length: totalComensales }, (_, i) => i + 1).map(n => {
            const items = carrito.filter(i => (i.comensal ?? 1) === n)
            if (items.length === 0) return null
            const color = COLORES_COMENSAL[(n - 1) % COLORES_COMENSAL.length]
            const subtotal = items.reduce((s, i) => s + precioItem(i) * i.cantidad, 0)
            return (
              <div key={n}>
                {/* Encabezado de persona */}
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--espresso)' }}>Comensal {n}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>{formatMoney(subtotal)}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {items.map(item => (
                    <ItemRow key={item.carritoKey} item={item} onActualizar={onActualizar} dotColor={color} />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          // Lista normal
          carrito.map(item => (
            <ItemRow key={item.carritoKey} item={item} onActualizar={onActualizar} />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        {/* Resumen por persona en modo split */}
        {dividirCuenta && (
          <div className="space-y-1 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
            {Array.from({ length: totalComensales }, (_, i) => i + 1).map(n => {
              const items = carrito.filter(i => (i.comensal ?? 1) === n)
              const subtotal = items.reduce((s, i) => s + precioItem(i) * i.cantidad, 0)
              const color = COLORES_COMENSAL[(n - 1) % COLORES_COMENSAL.length]
              return (
                <div key={n} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Comensal {n}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(subtotal)}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-between items-baseline mb-3">
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
