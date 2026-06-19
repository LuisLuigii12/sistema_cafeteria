/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { temaCategoria, CategoriaIcon } from '@/components/shared/categoria'
import { formatMoney } from '@/lib/format'
import type { Producto, ItemCarrito, Variante, Extra } from '@/types'

const EXTRAS: Extra[] = [
  { nombre: 'Leche de Almendras', precio: 15 },
  { nombre: 'Leche de Coco',      precio: 15 },
  { nombre: 'Leche Deslactosada', precio: 15 },
  { nombre: 'Leche Entera',       precio: 15 },
  { nombre: 'Leche Light',        precio: 15 },
  { nombre: 'Boba',               precio: 10 },
]

interface Props {
  productos: Producto[]
  carrito: ItemCarrito[]
  onAgregar: (producto: Producto, variante?: Variante, extras?: Extra[]) => void
}

export default function MenuGrid({ productos, carrito, onAgregar }: Props) {
  const [picker, setPicker] = useState<Producto | null>(null)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [varianteElegida, setVarianteElegida] = useState<Variante | null>(null)
  const [extrasElegidos, setExtrasElegidos] = useState<Extra[]>([])

  function cantidadEnCarrito(productoId: string) {
    return carrito
      .filter(i => i.producto.id === productoId)
      .reduce((s, i) => s + i.cantidad, 0)
  }

  function abrirPicker(producto: Producto) {
    setPicker(producto)
    setPaso(1)
    setVarianteElegida(null)
    setExtrasElegidos([])
  }

  function cerrarPicker() {
    setPicker(null)
    setPaso(1)
    setVarianteElegida(null)
    setExtrasElegidos([])
  }

  function elegirVariante(v: Variante) {
    setVarianteElegida(v)
    setPaso(2)
  }

  function toggleExtra(extra: Extra) {
    setExtrasElegidos(prev =>
      prev.some(e => e.nombre === extra.nombre)
        ? prev.filter(e => e.nombre !== extra.nombre)
        : [...prev, extra]
    )
  }

  function confirmar() {
    if (!picker) return
    onAgregar(picker, varianteElegida ?? undefined, extrasElegidos)
    cerrarPicker()
  }

  const precioTotal =
    (varianteElegida?.precio ?? picker?.precio ?? 0) +
    extrasElegidos.reduce((s, e) => s + e.precio, 0)

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" className="opacity-50">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin productos en esta categoría</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Grid de productos ── */}
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
              onClick={() => tieneVariantes ? abrirPicker(producto) : onAgregar(producto)}
              className="group relative text-left rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col animate-in disabled:cursor-not-allowed enabled:hover:-translate-y-1 enabled:active:translate-y-0"
              style={{
                animationDelay: `${Math.min(i * 25, 250)}ms`,
                background: 'var(--bg-card)',
                border: enCarrito ? '2px solid var(--gold)' : '2px solid transparent',
                boxShadow: enCarrito ? '0 8px 22px rgba(201,169,110,0.32)' : 'var(--shadow-md)',
                opacity: noDisponible ? 0.55 : 1,
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: tema.soft }}>
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{ color: tema.color, background: `linear-gradient(135deg, ${tema.soft}, ${tema.color}22)` }}>
                    <CategoriaIcon categoria={producto.categorias?.nombre} size={48} />
                  </div>
                )}
                {enCarrito && (
                  <span className="absolute top-2 left-2 min-w-7 h-7 px-2 rounded-full flex items-center justify-center text-sm font-bold tabular-nums animate-scale"
                    style={{ background: 'var(--gold)', color: 'var(--espresso)', boxShadow: 'var(--shadow-md)' }}>
                    {cantidad}
                  </span>
                )}
                {noDisponible && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(28,10,0,0.35)' }}>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--espresso)', color: '#FEF8F0' }}>Agotado</span>
                  </div>
                )}
              </div>

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
                    <span className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95"
                      style={{ background: enCarrito ? 'var(--gold)' : 'var(--espresso)', color: enCarrito ? 'var(--espresso)' : '#FEF8F0' }}
                      aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Modal picker ── */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(28,10,0,0.72)' }}
          onClick={cerrarPicker}
        >
          <div
            className="w-full max-w-sm animate-scale overflow-hidden"
            style={{ borderRadius: 22, boxShadow: '0 32px 72px rgba(28,10,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Paso 1: Tamaño ── */}
            {paso === 1 && (
              <>
                {/* Header */}
                <div style={{ background: 'var(--espresso)', padding: '20px 20px 18px' }}>
                  <p style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Elige el tamaño
                  </p>
                  <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, marginTop: 5, lineHeight: 1.2 }}>
                    {picker.nombre}
                  </h3>
                </div>

                {/* Variantes */}
                <div style={{ background: '#fff', padding: 16, display: 'grid', gridTemplateColumns: `repeat(${Math.min((picker.variantes ?? []).length, 3)}, 1fr)`, gap: 10 }}>
                  {(picker.variantes ?? []).map(v => (
                    <button
                      key={v.id}
                      onClick={() => elegirVariante(v)}
                      className="flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-2xl cursor-pointer transition-all active:scale-95 hover:brightness-95"
                      style={{ background: 'var(--gold-soft)', border: '2px solid var(--gold)' }}
                    >
                      <span style={{ color: 'var(--brown)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.03em' }}>{v.nombre}</span>
                      <span style={{ color: 'var(--espresso)', fontWeight: 800, fontSize: '1.2rem', fontFamily: "'Playfair Display', serif" }}>
                        {formatMoney(v.precio)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Cancelar */}
                <div style={{ background: '#fff', padding: '0 16px 18px' }}>
                  <button
                    onClick={cerrarPicker}
                    className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-[0.98]"
                    style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {/* ── Paso 2: Extras ── */}
            {paso === 2 && (
              <>
                {/* Header con botón atrás */}
                <div style={{ background: 'var(--espresso)', padding: '14px 16px 14px' }}>
                  <button
                    onClick={() => setPaso(1)}
                    className="flex items-center gap-2 cursor-pointer mb-3 active:opacity-70"
                    style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    Cambiar tamaño
                  </button>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.1 }}>
                        {picker.nombre}
                      </p>
                      <p style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>
                        {varianteElegida?.nombre}
                      </p>
                    </div>
                    <p style={{ color: 'var(--gold)', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 800 }}>
                      {formatMoney(varianteElegida?.precio ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Lista de extras */}
                <div style={{ background: '#fff' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px 8px' }}>
                    Extras opcionales
                  </p>
                  <div style={{ padding: '0 12px' }}>
                    {EXTRAS.map(extra => {
                      const activo = extrasElegidos.some(e => e.nombre === extra.nombre)
                      return (
                        <button
                          key={extra.nombre}
                          onClick={() => toggleExtra(extra)}
                          className="flex items-center gap-3 w-full py-3 px-3 rounded-xl cursor-pointer transition-all mb-1.5 active:scale-[0.99]"
                          style={{
                            background: activo ? 'var(--gold-soft)' : 'transparent',
                            border: activo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)',
                          }}
                        >
                          {/* Check circle */}
                          <div className="flex-shrink-0 flex items-center justify-center" style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: activo ? 'var(--gold)' : 'white',
                            border: activo ? 'none' : '2px solid var(--border)',
                            transition: 'all 0.15s',
                          }}>
                            {activo && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--espresso)" strokeWidth="3.5" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
                            {extra.nombre}
                          </span>
                          <span className="text-sm font-bold" style={{ color: activo ? 'var(--espresso)' : 'var(--text-muted)' }}>
                            +{formatMoney(extra.precio)}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '10px 16px 18px', borderTop: '1px solid var(--border-soft)', marginTop: 4 }}>
                    <button
                      onClick={confirmar}
                      className="w-full flex items-center justify-between py-4 px-5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] hover:brightness-110"
                      style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Agregar a la orden</span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1.15rem' }}>
                        {formatMoney(precioTotal)}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
