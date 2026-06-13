'use client'

import { useState } from 'react'
import type { CategoriaGasto } from '@/types'

interface Props {
  onGuardar: (gasto: { concepto: string; monto: number; categoria: CategoriaGasto }) => void
  onCerrar: () => void
}

const CATEGORIAS: { value: CategoriaGasto; label: string }[] = [
  { value: 'renta', label: 'Renta' },
  { value: 'sueldos', label: 'Sueldos' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'general', label: 'General' },
]

export default function GastoModal({ onGuardar, onCerrar }: Props) {
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState<CategoriaGasto>('general')

  const montoN = parseFloat(monto)
  const valido = concepto.trim().length > 0 && Number.isFinite(montoN) && montoN > 0

  function guardar() {
    if (!valido) return
    onGuardar({ concepto: concepto.trim(), monto: montoN, categoria })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(28,10,0,0.55)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-serif font-bold text-lg" style={{ color: 'var(--espresso)' }}>Registrar gasto</h3>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Concepto</label>
            <input
              autoFocus
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej: Compra de leche"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[var(--gold)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Categoría</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoria(c.value)}
                  className="py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  style={categoria === c.value
                    ? { background: 'var(--espresso)', color: '#FEF8F0' }
                    : { background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onCerrar} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={!valido}
            className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
          >
            Guardar gasto
          </button>
        </div>
      </div>
    </div>
  )
}
