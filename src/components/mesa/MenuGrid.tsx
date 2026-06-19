/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { temaCategoria, CategoriaIcon } from '@/components/shared/categoria'
import { formatMoney } from '@/lib/format'
import type { Producto, ItemCarrito, Variante } from '@/types'

interface Props {
  productos: Producto[]
  carrito: ItemCarrito[]
  onAgregar: (producto: Producto, variante?: Variante) => void
}

export default function MenuGrid({ productos, carrito, onAgregar }: Props) {
  const [picker, setPicker] = useState<Producto | null>(null)

  function cantidadEnCarrito(productoId: string) {
    return carrito
      .filter(i => i.producto.id === productoId)
      .reduce((s, i) => s + i.cantidad, 0)
  }

  function handleTap(producto: Producto) {
    if ((producto.variantes ?? []).length > 0) {
      setPicker(producto)
    } else {
      onAgregar(producto)
    }
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2" style={{ color: 'var(--gold)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-50">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin productos en esta categoría</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {productos.map((producto, i) => {
          const cantidad = cantidadEnCarrito(producto.id)
          const noDisponible = !producto.disponible
          const enCarrito = cantidad > 0
          const tieneVariantes = (producto.variantes ?? []).length > 0
          const tema = temaCategoria(producto.categorias?.nombre)
          const precioBase = (producto.variantes ?? [])[0]?.precio ?? producto.precio

          return (
            <button
              key={producto.id}
              disabled={noDisponible}
              onClick={() => handleTap(producto)}
              className="group relative text-left rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col animate-in disabled:cursor-not-allowed enabled:hover:-translate-y-1 enabled:active:translate-y-0"
              style={{
                animationDelay: `${Math.min(i * 25, 250)}ms`,
                background: 'var(--bg-card)',
                border: enCarrito ? '2px solid var(--gold)' : '2px solid transparent',
                boxShadow: enCarrito ? '0 8px 22px rgba(201,169,110,0.32)' : 'var(--shadow-md)',
                opacity: noDisponible ? 0.55 : 1,
              }}
            >
              {/* Imagen / placeholder */}
              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: tema.soft }}>
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{ color: tema.color, background: `linear-gradient(135deg, ${tema.soft}, ${tema.color}22)` }}
                  >
                    <CategoriaIcon categoria={producto.categorias?.nombre} size={48} />
                  </div>
                )}

                {enCarrito && (
                  <span
                    className="absolute top-2 left-2 min-w-7 h-7 px-2 rounded-full flex items-center justify-center text-sm font-bold tabular-nums animate-scale"
                    style={{ background: 'var(--gold)', color: 'var(--espresso)', boxShadow: 'var(--shadow-md)' }}
                  >
                    {cantidad}
                  </span>
                )}

                {noDisponible && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(28,10,0,0.35)' }}>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--espresso)', color: '#FEF8F0' }}>Agotado</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--espresso)' }}>{producto.nombre}</p>
                {producto.descripcion && (
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{producto.descripcion}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-base font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>
                      {tieneVariantes ? 'desde ' : ''}{formatMoney(precioBase)}
                    </p>
                    {tieneVariantes && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(producto.variantes ?? []).length} tamaños
                      </p>
                    )}
                  </div>
                  {!noDisponible && (
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95"
                      style={{ background: enCarrito ? 'var(--gold)' : 'var(--espresso)', color: enCarrito ? 'var(--espresso)' : '#FEF8F0' }}
                      aria-hidden
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Variant Picker Modal ── */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(28,10,0,0.7)' }}
          onClick={() => setPicker(null)}
        >
          <div
            className="w-full max-w-xs animate-scale"
            style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 64px rgba(28,10,0,0.45)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: 'var(--espresso)', padding: '18px 20px 14px' }}>
              <p style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Elige el tamaño
              </p>
              <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>
                {picker.nombre}
              </h3>
            </div>

            {/* Variantes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min((picker.variantes ?? []).length, 3)}, 1fr)`,
                gap: 10,
                padding: 16,
              }}
            >
              {(picker.variantes ?? []).map(v => (
                <button
                  key={v.id}
                  onClick={() => { onAgregar(picker, v); setPicker(null) }}
                  className="flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-xl cursor-pointer transition-all active:scale-95"
                  style={{ border: '2px solid var(--gold)', background: 'var(--gold-soft)' }}
                >
                  <span style={{ color: 'var(--espresso)', fontWeight: 700, fontSize: '0.9rem' }}>{v.nombre}</span>
                  <span style={{ color: 'var(--espresso)', fontWeight: 800, fontSize: '1.1rem', fontFamily: "'Playfair Display', serif" }}>
                    {formatMoney(v.precio)}
                  </span>
                </button>
              ))}
            </div>

            {/* Cancelar */}
            <div style={{ padding: '0 16px 16px' }}>
              <button
                onClick={() => setPicker(null)}
                className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-[0.98]"
                style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
