'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/format'
import {
  CREPA_GRUPOS,
  CREPA_PREMIUMS,
  CREPA_INCLUIDOS,
  CREPA_PRECIO_EXTRA,
  TERMINOS_HUEVO,
  ACOMPAÑAMIENTOS_HUEVO,
  TORTILLAS,
  INGREDIENTES_CHILAQUILES,
  SALSAS_CHILAQUILES,
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

function Radio({ activo }: { activo: boolean }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      background: activo ? 'var(--gold)' : 'white',
      border: activo ? 'none' : '2px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }}>
      {activo && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--espresso)' }} />}
    </div>
  )
}

function salsaInicial(tipo: TipoOpcionCocina, nombre: string): string | null {
  if (tipo !== 'chilaquiles') return null
  if (nombre.includes('Verde')) return 'Verde'
  if (nombre.includes('Roja')) return 'Roja'
  return null
}

export default function OpcionesCocinaModal({ producto, tipo, onConfirmar, onCerrar }: Props) {
  // Crepas / huevo
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [terminoHuevo, setTerminoHuevo] = useState<string | null>(null)
  const [acompañamiento, setAcompañamiento] = useState<string | null>(null)
  const [tortilla, setTortilla] = useState<string | null>(null)

  // Chilaquiles
  const [salsa, setSalsa] = useState<string | null>(() => salsaInicial(tipo, producto.nombre))
  const [ingredientesQuitados, setIngredientesQuitados] = useState<Set<string>>(new Set())

  const conHuevo = seleccionados.includes('2 Huevos al gusto')
  const esChilaquilConSalsa = tipo === 'chilaquiles' && producto.nombre.includes('Chilaquiles')

  function toggle(nombre: string) {
    setSeleccionados(prev =>
      prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
    )
    if (nombre === '2 Huevos al gusto' && seleccionados.includes(nombre)) {
      setTerminoHuevo(null)
      setAcompañamiento(null)
    }
  }

  function toggleIngrediente(nombre: string) {
    setIngredientesQuitados(prev => {
      const next = new Set(prev)
      if (next.has(nombre)) next.delete(nombre)
      else next.add(nombre)
      return next
    })
  }

  const normalesCount = seleccionados.filter(n => !CREPA_PREMIUMS.includes(n)).length
  const slotsLibres = Math.max(0, CREPA_INCLUIDOS - normalesCount)

  function precioTotal(): number {
    if (tipo === 'crepas') {
      const extras = buildExtrasCrepa(seleccionados)
      return producto.precio + extras.reduce((s, e) => s + e.precio, 0)
    }
    return producto.precio + (conHuevo ? 10 : 0)
  }

  function confirmar() {
    if (tipo === 'crepas') {
      onConfirmar(buildExtrasCrepa(seleccionados))
      return
    }
    if (tipo === 'tortilla') {
      onConfirmar(tortilla ? [{ nombre: tortilla, precio: 0 }] : [])
      return
    }
    if (tipo === 'chilaquiles') {
      const extras: Extra[] = []
      // Salsa (solo para chilaquiles, incluye mixtos)
      if (esChilaquilConSalsa && salsa) extras.push({ nombre: `Salsa ${salsa}`, precio: 0 })
      // Ingredientes quitados → "Sin X"
      INGREDIENTES_CHILAQUILES.forEach(i => {
        if (ingredientesQuitados.has(i)) extras.push({ nombre: `Sin ${i}`, precio: 0 })
      })
      // Huevo opcional
      if (conHuevo) {
        extras.push({ nombre: '2 Huevos al gusto', precio: 10 })
        if (terminoHuevo)   extras.push({ nombre: terminoHuevo,   precio: 0 })
        if (acompañamiento) extras.push({ nombre: acompañamiento, precio: 0 })
      }
      onConfirmar(extras)
      return
    }
    // 'huevo' puro
    if (!conHuevo) { onConfirmar([]); return }
    const extras: Extra[] = [{ nombre: '2 Huevos al gusto', precio: 10 }]
    if (terminoHuevo)   extras.push({ nombre: terminoHuevo,   precio: 0 })
    if (acompañamiento) extras.push({ nombre: acompañamiento, precio: 0 })
    onConfirmar(extras)
  }

  const labelHeader =
    tipo === 'crepas'      ? 'Elige tus ingredientes' :
    tipo === 'chilaquiles' ? 'Personaliza tu platillo' :
                             'Opciones'

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
            {labelHeader}
          </p>
          <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>
            {producto.nombre}
          </h3>
          {tipo === 'crepas' && (
            <div className="flex items-center gap-2 mt-3">
              <span style={{
                background: slotsLibres > 0 ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                color: slotsLibres > 0 ? 'var(--espresso)' : '#FEF8F0',
                borderRadius: 20, padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700,
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

          {/* ── Crepas ── */}
          {tipo === 'crepas' && (
            <>
              {CREPA_GRUPOS.map(grupo => (
                <div key={grupo.nombre}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 16px 5px' }}>
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
                          style={{ background: activo ? 'var(--gold-soft)' : 'transparent', border: activo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)' }}
                        >
                          <Checkbox activo={activo} />
                          <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>{item}</span>
                          {costo > 0 ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activo ? 'var(--espresso)' : 'var(--text-muted)' }}>+{formatMoney(costo)}</span>
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

          {/* ── Chilaquiles / Omelette Chila ── */}
          {tipo === 'chilaquiles' && (
            <div style={{ padding: '12px 12px 0' }}>

              {/* Salsa (solo para Chilaquiles, no Omelette) */}
              {esChilaquilConSalsa && (
                <>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 4px 8px' }}>
                    Salsa
                  </p>
                  <div className="flex gap-2 mb-3">
                    {SALSAS_CHILAQUILES.map(s => {
                      const activo = salsa === s
                      return (
                        <button
                          key={s}
                          onClick={() => setSalsa(s)}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95 flex-1 justify-center"
                          style={{
                            background: activo ? 'var(--gold)' : 'white',
                            color: activo ? 'var(--espresso)' : 'var(--text-muted)',
                            border: activo ? 'none' : '1px solid var(--border)',
                          }}
                        >
                          <Radio activo={activo} />
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Ingredientes — todos activados por defecto */}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 4px 8px' }}>
                Ingredientes
              </p>
              {INGREDIENTES_CHILAQUILES.map(item => {
                const quitado = ingredientesQuitados.has(item)
                return (
                  <button
                    key={item}
                    onClick={() => toggleIngrediente(item)}
                    className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl cursor-pointer transition-all mb-1.5 active:scale-[0.99]"
                    style={{
                      background: quitado ? '#FEF2F2' : 'var(--gold-soft)',
                      border: quitado ? '1.5px solid #FCA5A5' : '1.5px solid var(--gold)',
                    }}
                  >
                    <Checkbox activo={!quitado} />
                    <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>{item}</span>
                    {quitado && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EF4444' }}>Sin {item}</span>
                    )}
                  </button>
                )
              })}

              {/* Huevo opcional */}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 4px 8px' }}>
                Opcional
              </p>
              <button
                onClick={() => toggle('2 Huevos al gusto')}
                className="flex items-center gap-3 w-full py-3 px-3 rounded-xl cursor-pointer transition-all mb-2 active:scale-[0.99]"
                style={{ background: conHuevo ? 'var(--gold-soft)' : 'transparent', border: conHuevo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)' }}
              >
                <Checkbox activo={conHuevo} />
                <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>2 Huevos al gusto</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: conHuevo ? 'var(--espresso)' : 'var(--text-muted)' }}>+{formatMoney(10)}</span>
              </button>

              {conHuevo && (
                <div
                  className="rounded-2xl overflow-hidden mb-3"
                  style={{ border: '1px solid var(--border-soft)', background: 'var(--bg-card-soft)' }}
                >
                  <div style={{ padding: '10px 12px 6px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Término
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {TERMINOS_HUEVO.map(t => {
                        const activo = terminoHuevo === t
                        return (
                          <button
                            key={t}
                            onClick={() => setTerminoHuevo(activo ? null : t)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95"
                            style={{
                              background: activo ? 'var(--gold)' : 'white',
                              color: activo ? 'var(--espresso)' : 'var(--text-muted)',
                              border: activo ? 'none' : '1px solid var(--border)',
                            }}
                          >
                            <Radio activo={activo} />
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--border-soft)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Acompañamiento
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {ACOMPAÑAMIENTOS_HUEVO.map(a => {
                        const activo = acompañamiento === a
                        return (
                          <button
                            key={a}
                            onClick={() => setAcompañamiento(activo ? null : a)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95"
                            style={{
                              background: activo ? 'var(--gold)' : 'white',
                              color: activo ? 'var(--espresso)' : 'var(--text-muted)',
                              border: activo ? 'none' : '1px solid var(--border)',
                            }}
                          >
                            <Radio activo={activo} />
                            {a}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Huevo (puro) ── */}
          {tipo === 'huevo' && (
            <div style={{ padding: '12px 12px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 4px 8px' }}>
                Opcional
              </p>
              <button
                onClick={() => toggle('2 Huevos al gusto')}
                className="flex items-center gap-3 w-full py-3 px-3 rounded-xl cursor-pointer transition-all mb-2 active:scale-[0.99]"
                style={{ background: conHuevo ? 'var(--gold-soft)' : 'transparent', border: conHuevo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)' }}
              >
                <Checkbox activo={conHuevo} />
                <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>2 Huevos al gusto</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: conHuevo ? 'var(--espresso)' : 'var(--text-muted)' }}>+{formatMoney(10)}</span>
              </button>

              {conHuevo && (
                <div
                  className="rounded-2xl overflow-hidden mb-3"
                  style={{ border: '1px solid var(--border-soft)', background: 'var(--bg-card-soft)' }}
                >
                  <div style={{ padding: '10px 12px 6px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Término
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {TERMINOS_HUEVO.map(t => {
                        const activo = terminoHuevo === t
                        return (
                          <button
                            key={t}
                            onClick={() => setTerminoHuevo(activo ? null : t)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95"
                            style={{
                              background: activo ? 'var(--gold)' : 'white',
                              color: activo ? 'var(--espresso)' : 'var(--text-muted)',
                              border: activo ? 'none' : '1px solid var(--border)',
                            }}
                          >
                            <Radio activo={activo} />
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--border-soft)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Acompañamiento
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {ACOMPAÑAMIENTOS_HUEVO.map(a => {
                        const activo = acompañamiento === a
                        return (
                          <button
                            key={a}
                            onClick={() => setAcompañamiento(activo ? null : a)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95"
                            style={{
                              background: activo ? 'var(--gold)' : 'white',
                              color: activo ? 'var(--espresso)' : 'var(--text-muted)',
                              border: activo ? 'none' : '1px solid var(--border)',
                            }}
                          >
                            <Radio activo={activo} />
                            {a}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tortillas ── */}
          {tipo === 'tortilla' && (
            <div style={{ padding: '12px 12px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 4px 8px' }}>
                Tortillas (gratis)
              </p>
              {TORTILLAS.map((t) => {
                const activo = tortilla === t
                return (
                  <button
                    key={t}
                    onClick={() => setTortilla(activo ? null : t)}
                    className="flex items-center gap-3 w-full py-3 px-3 rounded-xl cursor-pointer transition-all mb-1.5 active:scale-[0.99]"
                    style={{ background: activo ? 'var(--gold-soft)' : 'transparent', border: activo ? '1.5px solid var(--gold)' : '1.5px solid var(--border-soft)' }}
                  >
                    <Radio activo={activo} />
                    <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--espresso)' }}>{t}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--gold)' }}>Gratis</span>
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
