'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney, formatPercent } from '@/lib/format'
import type { Categoria } from '@/types'

interface Props {
  categorias: Categoria[]
  onGuardar: () => void
  onCerrar: () => void
}

function num(v: string, fallback = 0) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

export default function NuevoProductoModal({ categorias, onGuardar, onCerrar }: Props) {
  const [nombre, setNombre] = useState('')
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? '')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [costo, setCosto] = useState('')
  const [stock, setStock] = useState('')
  const [stockMinimo, setStockMinimo] = useState('5')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const precioN = num(precio)
  const costoN = num(costo)
  const margen = precioN - costoN
  const margenPct = precioN > 0 ? margen / precioN : 0
  const valido = nombre.trim().length > 0 && categoriaId && precioN > 0

  async function guardar() {
    if (!valido) { setError('Pon al menos nombre, categoría y precio'); return }
    setGuardando(true); setError(null)
    const { error } = await supabase.from('productos').insert({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      categoria_id: categoriaId,
      precio: precioN,
      costo: Math.max(0, costoN),
      stock: Math.max(0, Math.round(num(stock))),
      stock_minimo: Math.max(0, Math.round(num(stockMinimo))),
      disponible: true,
    })
    if (error) { setError('No se pudo crear el producto'); setGuardando(false); return }
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
          <h3 className="font-serif font-bold text-lg" style={{ color: 'var(--espresso)' }}>Nuevo producto</h3>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre</label>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Frappé de moka"
              className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-[var(--gold)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoriaId(c.id)}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                  style={categoriaId === c.id
                    ? { background: 'var(--espresso)', color: '#FEF8F0' }
                    : { background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Descripción <span className="normal-case font-normal">(opcional)</span></label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Con crema batida"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[var(--gold)]"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
            />
          </div>

          {/* Precio + costo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Precio de venta</label>
              <input type="number" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Costo</label>
              <input type="number" inputMode="decimal" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
            </div>
          </div>

          {/* Margen preview */}
          {precioN > 0 && (
            <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--bg-card-soft)', border: '1px solid var(--border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Ganancia por unidad</span>
              <span className="text-base font-bold tabular-nums" style={{ color: margen >= 0 ? '#15803D' : '#EF4444' }}>
                {formatMoney(margen)} · {formatPercent(margenPct)}
              </span>
            </div>
          )}

          {/* Stock + minimo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Stock inicial</label>
              <input type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Stock mínimo</label>
              <input type="number" inputMode="numeric" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-[var(--gold)]" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }} />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ background: 'var(--red-soft)', color: 'var(--red-text)' }}>{error}</p>
          )}
        </div>

        <div className="p-5 flex gap-3 sticky bottom-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <button onClick={onCerrar} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando || !valido}
            className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
          >
            {guardando ? 'Creando...' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
