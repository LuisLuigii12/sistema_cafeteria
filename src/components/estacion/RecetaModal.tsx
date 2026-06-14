'use client'

import { useState } from 'react'

interface Props {
  nombre: string
  ingredientes: string | null
  preparacion: string | null
  onCerrar: () => void
}

function lineas(texto: string | null): string[] {
  if (!texto) return []
  return texto.split('\n').map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean)
}

export default function RecetaModal({ nombre, ingredientes, preparacion, onCerrar }: Props) {
  const ings = lineas(ingredientes)
  const pasos = lineas(preparacion)
  const [marcados, setMarcados] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setMarcados((prev) => {
      const n = new Set(prev)
      if (n.has(i)) n.delete(i); else n.add(i)
      return n
    })
  }

  const sinReceta = ings.length === 0 && pasos.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(10,5,0,0.7)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-lg sm:max-h-[92vh] overflow-y-auto scrollbar-thin sm:rounded-3xl animate-scale"
        style={{ background: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between sticky top-0 z-10" style={{ background: 'var(--espresso)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gold)', color: 'var(--espresso)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 11h.01" /><path d="M11 15h.01" /><path d="M16 16h.01" /><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" /><path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
              </svg>
            </span>
            <div className="min-w-0">
              <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Cómo preparar</p>
              <h3 className="font-serif font-bold text-xl truncate" style={{ color: '#FEF8F0' }}>{nombre}</h3>
            </div>
          </div>
          <button onClick={onCerrar} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 flex-shrink-0" style={{ color: 'var(--gold)' }} aria-label="Cerrar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {sinReceta ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Este producto aún no tiene receta. Agrégala desde Inventario → editar producto.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Ingredientes */}
            {ings.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--brown)' }}>Lleva</h4>
                <div className="space-y-2">
                  {ings.map((ing, i) => {
                    const ok = marcados.has(i)
                    return (
                      <button
                        key={i}
                        onClick={() => toggle(i)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all active:scale-[0.99]"
                        style={{ background: ok ? 'var(--green-soft)' : 'var(--bg-card-soft)', border: `1px solid ${ok ? '#86EFAC' : 'var(--border)'}` }}
                      >
                        <span className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: ok ? 'var(--green)' : 'var(--bg-card)', border: `1.5px solid ${ok ? 'var(--green)' : 'var(--border)'}` }}>
                          {ok && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </span>
                        <span className="text-base font-medium" style={{ color: ok ? 'var(--green-text)' : 'var(--espresso)', textDecoration: ok ? 'line-through' : 'none' }}>{ing}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pasos */}
            {pasos.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--brown)' }}>Pasos</h4>
                <ol className="space-y-3">
                  {pasos.map((paso, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'var(--gold)', color: 'var(--espresso)' }}>{i + 1}</span>
                      <p className="text-base leading-snug pt-1" style={{ color: 'var(--espresso)' }}>{paso}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-5 sticky bottom-0" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <button onClick={onCerrar} className="w-full py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99]" style={{ background: 'var(--espresso)', color: '#FEF8F0' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
