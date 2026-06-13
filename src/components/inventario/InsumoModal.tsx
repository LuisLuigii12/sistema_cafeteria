'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney } from '@/lib/format'
import type { Insumo, UnidadInsumo } from '@/types'

interface Props {
  insumo: Insumo | null   // null = crear nuevo
  onGuardar: () => void
  onCerrar: () => void
}

const UNIDADES: UnidadInsumo[] = ['kg', 'g', 'L', 'ml', 'pz']

function num(v: string, fallback = 0) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

export default function InsumoModal({ insumo, onGuardar, onCerrar }: Props) {
  const esNuevo = !insumo
  const [nombre, setNombre] = useState(insumo?.nombre ?? '')
  const [unidad, setUnidad] = useState<string>(insumo?.unidad ?? 'pz')
  const [stock, setStock] = useState(String(insumo?.stock ?? ''))
  const [stockMinimo, setStockMinimo] = useState(String(insumo?.stock_minimo ?? '0'))
  const [costo, setCosto] = useState(String(insumo?.costo ?? ''))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valido = nombre.trim().length > 0
  const valorTotal = num(costo) * num(stock)

  function reabastecer(n: number) {
    setStock((prev) => String(Math.max(0, num(prev) + n)))
  }

  async function guardar() {
    if (!valido) { setError('Escribe el nombre del insumo'); return }
    setGuardando(true); setError(null)
    const datos = {
      nombre: nombre.trim(),
      unidad,
      stock: Math.max(0, num(stock)),
      stock_minimo: Math.max(0, num(stockMinimo)),
      costo: Math.max(0, num(costo)),
    }
    const res = esNuevo
      ? await supabase.from('insumos').insert(datos)
      : await supabase.from('insumos').update(datos).eq('id', insumo!.id)
    if (res.error) { setError('No se pudo guardar'); setGuardando(false); return }
    onGuardar()
  }

  async function eliminar() {
    if (!insumo) return
    setGuardando(true)
    await supabase.from('insumos').delete().eq('id', insumo.id)
    onGuardar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(28,10,0,0.55)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin rounded-t-3xl sm:rounded-3xl animate-scale"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-center justify-between sticky top-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <h3 className="font-serif font-bold text-lg" style={{ color: 'var(--espresso)' }}>
            {esNuevo ? 'Nuevo insumo' : 'Editar insumo'}
          </h3>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre</label>
            <input
              autoFocus={esNuevo}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Café en grano"
              className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-[var(--gold)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
            />
          </div>

          {/* Unidad */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Unidad de medida</label>
            <div className="flex flex-wrap gap-2">
              {UNIDADES.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnidad(u)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                  style={unidad === u
                    ? { background: 'var(--espresso)', color: '#FEF8F0' }
                    : { background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Reabastecer */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Reabastecer</label>
            <div className="flex gap-2 mt-1.5">
              {[1, 5, 10, 25].map((n) => (
                <button key={n} onClick={() => reabastecer(n)} className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>
                  +{n}
                </button>
              ))}
            </div>
          </div>

          {/* Stock + mínimo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Existencias ({unidad})</label>
              <input type="number" inputMode="decimal" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Mínimo ({unidad})</label>
              <input type="number" inputMode="decimal" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
            </div>
          </div>

          {/* Costo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Costo por {unidad}</label>
            <input type="number" inputMode="decimal" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
          </div>

          {/* Valor total */}
          {valorTotal > 0 && (
            <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--bg-card-soft)', border: '1px solid var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Valor en inventario</span>
              <span className="text-base font-bold tabular-nums" style={{ color: 'var(--espresso)' }}>{formatMoney(valorTotal)}</span>
            </div>
          )}

          {error && <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}>{error}</p>}
        </div>

        <div className="p-5 flex gap-3 sticky bottom-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          {!esNuevo && (
            <button onClick={eliminar} disabled={guardando} className="px-4 py-3 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50" style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}>
              Eliminar
            </button>
          )}
          <button onClick={onCerrar} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando || !valido} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}>
            {guardando ? 'Guardando...' : esNuevo ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
