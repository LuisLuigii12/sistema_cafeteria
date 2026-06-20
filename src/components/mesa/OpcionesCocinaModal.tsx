'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/format'
import {
  CREPA_GRUPOS,
  CREPA_PREMIUMS,
  CREPA_INCLUIDOS,
  CREPA_PRECIO_EXTRA,
  buildExtrasCrepa,
  costoSiSeAgrega,
  type TipoOpcionCocina,
} from '@/lib/opciones-cocina'
import type { Extra, Producto } from '@/types'

interface Props {
  producto: Producto
  tipo: TipoOpcionCocina
  onConfirmar: (extras: Extra[]) => void
  onCerrar: () => void
}

function Checkbox({ activo }: { activo: boolean }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
      background: activo ? 'var(--gold)' : 'white',
      border: activo ? 'none' : '2px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }}>
      {activo && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--espresso)" strokeWidth="3.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

export default function OpcionesCocinaModal({ producto, tipo, onConfirmar, onCerrar }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  function toggle(nombre: string) {
    setSeleccionados(prev =>
      prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
    )
  }

  const normalesCount = seleccionados.filter(n => !CREPA_PREMIUMS.includes(n)).length
  const slotsLibres = Math.max(0, CREPA_INCLUIDOS - normalesCount)

  function precioTotal(): number {
    if (tipo === 'crepas') {
      const extras = buildExtrasCrepa(seleccionados)
      return producto.precio + extras.reduce((s, e) => s + e.precio, 0)
    }
    return producto.precio + (seleccionados.includes('2 Huevos al gusto') ? 10 : 0)
  }

  function confirmar() {
    if (tipo === 'crepas') {
      onConfirmar(buildExtrasCrepa(seleccionados))
    } else {
      onConfirmar(seleccionados.includes('2 Huevos al gusto')
        ? [{ nombre: '2 Huevos al gusto', precio: 10 }]
        : []
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(28,10,0,0.72)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm animate-scale flex flex-col overflow-hidden"
        style={{ borderRadius: 22, boxShadow: '0 32px 72px rgba(28,10,0,0.5)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ background: 'var(--espresso)', padding: '18px 20px 16px', flexShrink: 0 }}>
          <p style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 700 }}>
            {tipo === 'crepas' ? 'Elige tus ingredientes' : 'Opciones'}
          </p>
          <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>
            {producto.nombre}
          </h3>

          {tipo === 'crepas' && (
            <div className="flex items-center gap-2 mt-3">
              <span style={{
                background: slotsLibres > 0 ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                color: slotsLibres > 0 ? 'var(--espresso)' : '#FEF8F0',
                borderRadius: 20, padding: '3px 12px',
                fontSize: '0.72rem', fontWeight: 700,
              }}>
                {slotsLibres > 0
                  ? `${slotsLibres} ingrediente${slotsLibres > 1 ? 's' : ''} incluido${slotsLibres > 1 ? 's' : ''} disponible${slotsLibres > 1 ? 's' : ''}`
                  : `Ingredientes extra · +$${CREPA_PRECIO_EXTRA} c/u`
                }
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ background: '#fff', overflowY: 'auto', flex: 1 }}>

          {tipo === 'crepas' && (
            <>
              {CREPA_GRUPOS.map(grupo => (
                <div key={grupo.nombre}>
                  <p style={{
                    color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 16px 5px',
                  }}>
                    {grupo.nombre}
                  </p>
                  <div style={{ padding: '0 12px' }}>
                    {grupo.items.map(item => {
                      const activo = seleccionados.includes(item)
                      const costo = activo
                        ? buildExtrasCrepa(seleccionados).find(e => e.nombre === item)?.precio ?? 0
                        : costoSiSeAgrega(item, normalesCount)

                      return (
                        <button
                          key={item}
                          onClick={() => toggle(item)}
                          className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl cursor-pointer transition-all mb-1.5 active:scale-[0.99]"
                          style={{
                            background: activo ? 'var(--gold-soft)' : 'transparent',
                            border: activo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)',
                          }}
                        >
                          <Checkbox activo={activo} />
                          <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
                            {item}
                          </span>
                          {costo > 0 ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activo ? 'var(--espresso)' : 'var(--text-muted)' }}>
                              +{formatMoney(costo)}
                            </span>
                          ) : activo ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--gold)' }}>Incluido</span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {tipo === 'huevo' && (
            <div style={{ padding: '12px 12px 0' }}>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 4px 10px',
              }}>
                Opcional
              </p>
              {['2 Huevos al gusto'].map(item => {
                const activo = seleccionados.includes(item)
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    className="flex items-center gap-3 w-full py-3 px-3 rounded-xl cursor-pointer transition-all mb-1.5 active:scale-[0.99]"
                    style={{
                      background: activo ? 'var(--gold-soft)' : 'transparent',
                      border: activo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)',
                    }}
                  >
                    <Checkbox activo={activo} />
                    <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>
                      {item}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activo ? 'var(--espresso)' : 'var(--text-muted)' }}>
                      +{formatMoney(10)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ padding: '12px 16px 18px', borderTop: '1px solid var(--border-soft)', marginTop: 8 }}>
            <button
              onClick={confirmar}
              className="w-full flex items-center justify-between py-4 px-5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] hover:brightness-110"
              style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Agregar a la orden</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1.15rem' }}>
                {formatMoney(precioTotal())}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
