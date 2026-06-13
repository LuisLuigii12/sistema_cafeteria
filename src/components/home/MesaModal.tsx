'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Mesa } from '@/types'

interface Props {
  mesa: Mesa | null            // null = crear nueva
  sugerenciaNumero: number     // número propuesto al crear
  onGuardar: () => void        // refrescar + cerrar
  onCerrar: () => void
}

export default function MesaModal({ mesa, sugerenciaNumero, onGuardar, onCerrar }: Props) {
  const esNueva = !mesa
  const [numero, setNumero] = useState(String(mesa?.numero ?? sugerenciaNumero))
  const [capacidad, setCapacidad] = useState(mesa?.capacidad ?? 4)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar() {
    const num = parseInt(numero, 10)
    if (!Number.isFinite(num) || num <= 0) { setError('Escribe un número de mesa válido'); return }
    setGuardando(true); setError(null)

    const res = esNueva
      ? await supabase.from('mesas').insert({ numero: num, capacidad, estado: 'libre' })
      : await supabase.from('mesas').update({ numero: num, capacidad }).eq('id', mesa!.id)

    if (res.error) {
      setError(res.error.code === '23505' ? `Ya existe la mesa ${num}` : 'No se pudo guardar')
      setGuardando(false)
      return
    }
    onGuardar()
  }

  async function eliminar() {
    if (!mesa) return
    setGuardando(true); setError(null)
    const { error } = await supabase.from('mesas').delete().eq('id', mesa.id)
    if (error) {
      setError('No se puede eliminar: la mesa tiene órdenes registradas')
      setGuardando(false)
      return
    }
    onGuardar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(28,10,0,0.55)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-serif font-bold text-lg" style={{ color: 'var(--espresso)' }}>
            {esNueva ? 'Nueva mesa' : `Editar mesa ${mesa?.numero}`}
          </h3>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Número */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Número de mesa</label>
            <input
              type="number"
              inputMode="numeric"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Personas que caben</label>
            <div className="flex items-center justify-between rounded-xl px-2 py-2" style={{ border: '1px solid var(--border)', background: 'var(--bg-card-soft)' }}>
              <button
                onClick={() => setCapacidad((c) => Math.max(1, c - 1))}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
                style={{ color: 'var(--espresso)' }}
                aria-label="Menos"
              >−</button>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--espresso)' }}>{capacidad}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>personas</span>
              </div>
              <button
                onClick={() => setCapacidad((c) => Math.min(20, c + 1))}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-colors hover:bg-[var(--gold-soft)]"
                style={{ color: 'var(--espresso)' }}
                aria-label="Más"
              >+</button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}>{error}</p>
          )}
        </div>

        <div className="p-5 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          {!esNueva && (
            <button
              onClick={eliminar}
              disabled={guardando}
              className="px-4 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors disabled:opacity-50"
              style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}
            >
              Eliminar
            </button>
          )}
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
          >
            {guardando ? 'Guardando...' : esNueva ? 'Crear mesa' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
