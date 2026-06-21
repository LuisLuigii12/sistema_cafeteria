'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/format'
import { EXTRAS, EXTRAS_AZUCARES, CATEGORIAS_CALIENTES, precioUnitario } from '@/lib/opciones'
import type { Producto, Variante, Extra } from '@/types'

interface Props {
  producto: Producto
  varianteInicial?: Variante | null
  extrasIniciales?: Extra[]
  modo?: 'agregar' | 'editar'
  onConfirmar: (variante: Variante | null, extras: Extra[]) => void
  onCerrar: () => void
}

/** Modal de 2 pasos (tamaño + extras). Se usa al agregar del menú y al corregir una orden ya enviada. */
export default function OpcionesModal({
  producto,
  varianteInicial = null,
  extrasIniciales = [],
  modo = 'agregar',
  onConfirmar,
  onCerrar,
}: Props) {
  const variantes = producto.variantes ?? []
  const esCaliente = CATEGORIAS_CALIENTES.includes(producto.categorias?.nombre ?? '')
  const extrasDisponibles = esCaliente ? [...EXTRAS, ...EXTRAS_AZUCARES] : EXTRAS
  const [paso, setPaso] = useState<1 | 2>(varianteInicial ? 2 : 1)
  const [varianteElegida, setVarianteElegida] = useState<Variante | null>(varianteInicial)
  const [extrasElegidos, setExtrasElegidos] = useState<Extra[]>(extrasIniciales)

  function elegirVariante(v: Variante) {
    setVarianteElegida(v)
    setPaso(2)
  }

  function toggleExtra(extra: Extra) {
    setExtrasElegidos((prev) =>
      prev.some((e) => e.nombre === extra.nombre)
        ? prev.filter((e) => e.nombre !== extra.nombre)
        : [...prev, extra],
    )
  }

  const precioTotal = precioUnitario(producto, varianteElegida, extrasElegidos)
  const ctaLabel = modo === 'editar' ? 'Guardar cambios' : 'Agregar a la orden'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(28,10,0,0.72)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm animate-scale overflow-hidden"
        style={{ borderRadius: 22, boxShadow: '0 32px 72px rgba(28,10,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Paso 1: Tamaño ── */}
        {paso === 1 && (
          <>
            <div style={{ background: 'var(--espresso)', padding: '20px 20px 18px' }}>
              <p style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 700 }}>
                Elige el tamaño
              </p>
              <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, marginTop: 5, lineHeight: 1.2 }}>
                {producto.nombre}
              </h3>
            </div>

            <div style={{ background: '#fff', padding: 16, display: 'grid', gridTemplateColumns: `repeat(${Math.min(variantes.length, 3)}, 1fr)`, gap: 10 }}>
              {variantes.map((v) => (
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

            <div style={{ background: '#fff', padding: '0 16px 18px' }}>
              <button
                onClick={onCerrar}
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
            <div style={{ background: 'var(--espresso)', padding: '14px 16px 14px' }}>
              {variantes.length > 0 && (
                <button
                  onClick={() => setPaso(1)}
                  className="flex items-center gap-2 cursor-pointer mb-3 active:opacity-70"
                  style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Cambiar tamaño
                </button>
              )}
              <div className="flex items-baseline justify-between">
                <div>
                  <p style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.1 }}>
                    {producto.nombre}
                  </p>
                  <p style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>
                    {varianteElegida?.nombre}
                  </p>
                </div>
                <p style={{ color: 'var(--gold)', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 800 }}>
                  {formatMoney(varianteElegida?.precio ?? producto.precio)}
                </p>
              </div>
            </div>

            <div style={{ background: '#fff' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 16px 8px' }}>
                Extras opcionales
              </p>
              <div style={{ padding: '0 12px' }}>
                {extrasDisponibles.map((extra) => {
                  const activo = extrasElegidos.some((e) => e.nombre === extra.nombre)
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
                      <div className="flex-shrink-0 flex items-center justify-center" style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: activo ? 'var(--gold)' : 'white',
                        border: activo ? 'none' : '2px solid var(--border)',
                        transition: 'all 0.15s',
                      }}>
                        {activo && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--espresso)" strokeWidth="3.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
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

              <div style={{ padding: '10px 16px 18px', borderTop: '1px solid var(--border-soft)', marginTop: 4 }}>
                <button
                  onClick={() => onConfirmar(varianteElegida, extrasElegidos)}
                  className="w-full flex items-center justify-between py-4 px-5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] hover:brightness-110"
                  style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ctaLabel}</span>
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
  )
}
