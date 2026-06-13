'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import InsumoRow from '@/components/inventario/InsumoRow'
import InsumoModal from '@/components/inventario/InsumoModal'
import { formatMoneyShort } from '@/lib/format'
import type { Insumo } from '@/types'

export default function InsumosPanel() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<Insumo | null>(null)
  const [creando, setCreando] = useState(false)

  async function fetchInsumos() {
    const { data } = await supabase.from('insumos').select('*').order('nombre')
    if (data) setInsumos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchInsumos()
    const channel = supabase
      .channel('insumos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insumos' }, fetchInsumos)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const stats = useMemo(() => {
    const valor = insumos.reduce((s, i) => s + i.costo * i.stock, 0)
    const bajos = insumos.filter((i) => i.stock > 0 && i.stock <= i.stock_minimo).length
    const agotados = insumos.filter((i) => i.stock <= 0).length
    return { total: insumos.length, valor, bajos, agotados }
  }, [insumos])

  const visibles = insumos.filter((i) => !busqueda || i.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  async function ajustarStock(id: string, delta: number) {
    const ins = insumos.find((i) => i.id === id)
    if (!ins) return
    const nuevo = Math.max(0, ins.stock + delta)
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, stock: nuevo } : i)))
    await supabase.from('insumos').update({ stock: nuevo }).eq('id', id)
  }

  const tarjetas = [
    { label: 'Insumos', valor: String(stats.total), color: '#A8743F' },
    { label: 'Valor en inventario', valor: formatMoneyShort(stats.valor), color: '#16A34A' },
    { label: 'Stock bajo', valor: String(stats.bajos), color: '#F59E0B' },
    { label: 'Agotados', valor: String(stats.agotados), color: '#EF4444' },
  ]

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {tarjetas.map((t, i) => (
          <div key={t.label} className="rounded-2xl p-4 animate-in" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 50}ms` }}>
            <span className="w-2.5 h-2.5 rounded-full inline-block mb-2" style={{ background: t.color }} />
            <p className="tabular-nums" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--espresso)', lineHeight: 1 }}>{t.valor}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar insumo..." className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--espresso)' }} />
        </div>
        <button onClick={() => setCreando(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:brightness-105 active:scale-[0.98]" style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Agregar insumo
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#E8D5BB' }} />)}</div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p>{insumos.length === 0 ? 'Aún no hay insumos. Agrega el primero.' : 'No hay insumos que coincidan'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibles.map((ins, i) => (
            <InsumoRow key={ins.id} insumo={ins} index={i} onAjustar={ajustarStock} onEditar={setEditando} />
          ))}
        </div>
      )}

      {(editando || creando) && (
        <InsumoModal
          insumo={editando}
          onGuardar={() => { setEditando(null); setCreando(false); fetchInsumos() }}
          onCerrar={() => { setEditando(null); setCreando(false) }}
        />
      )}
    </>
  )
}
