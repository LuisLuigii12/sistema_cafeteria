'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TopNav from '@/components/shared/TopNav'
import ProductoRow from '@/components/inventario/ProductoRow'
import EditarProductoModal from '@/components/inventario/EditarProductoModal'
import NuevoProductoModal from '@/components/inventario/NuevoProductoModal'
import InsumosPanel from '@/components/inventario/InsumosPanel'
import { formatMoneyShort } from '@/lib/format'
import type { Producto, Categoria } from '@/types'

// Inventario solo lleva productos que se cuentan por pieza (no los que se hacen al momento).
const CATEGORIAS_INVENTARIO = ['Vitrina', 'Otros']

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'bajo' | 'agotado'>('todos')
  const [editando, setEditando] = useState<Producto | null>(null)
  const [creando, setCreando] = useState(false)
  const [vista, setVista] = useState<'venta' | 'insumos'>('venta')

  async function fetchProductos() {
    const { data } = await supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .order('nombre')
    if (data) setProductos(data.filter((p) => CATEGORIAS_INVENTARIO.includes(p.categorias?.nombre ?? '')))
    setLoading(false)
  }

  useEffect(() => {
    fetchProductos()
    supabase.from('categorias').select('*').order('orden').then(({ data }) => { if (data) setCategorias(data) })
    const channel = supabase
      .channel('inventario')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, fetchProductos)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const stats = useMemo(() => {
    const valor = productos.reduce((s, p) => s + p.costo * p.stock, 0)
    const bajos = productos.filter((p) => p.stock > 0 && p.stock <= p.stock_minimo).length
    const agotados = productos.filter((p) => p.stock <= 0).length
    return { total: productos.length, valor, bajos, agotados }
  }, [productos])

  const visibles = useMemo(() => {
    return productos.filter((p) => {
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      if (filtro === 'bajo') return p.stock > 0 && p.stock <= p.stock_minimo
      if (filtro === 'agotado') return p.stock <= 0
      return true
    })
  }, [productos, busqueda, filtro])

  async function ajustarStock(id: string, delta: number) {
    const prod = productos.find((p) => p.id === id)
    if (!prod) return
    const nuevo = Math.max(0, prod.stock + delta)
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, stock: nuevo } : p)))
    await supabase.from('productos').update({ stock: nuevo }).eq('id', id)
  }

  async function toggleDisponible(prod: Producto) {
    setProductos((prev) => prev.map((p) => (p.id === prod.id ? { ...p, disponible: !p.disponible } : p)))
    await supabase.from('productos').update({ disponible: !prod.disponible }).eq('id', prod.id)
  }

  async function guardarEdicion(id: string, cambios: Partial<Producto>) {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)))
    setEditando(null)
    await supabase.from('productos').update(cambios).eq('id', id)
  }

  const tarjetas = [
    { label: 'Productos', valor: String(stats.total), color: '#A8743F', icon: <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></> },
    { label: 'Valor del inventario', valor: formatMoneyShort(stats.valor), color: '#16A34A', icon: <><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
    { label: 'Stock bajo', valor: String(stats.bajos), color: '#F59E0B', icon: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></> },
    { label: 'Agotados', valor: String(stats.agotados), color: '#EF4444', icon: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></> },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-thin" style={{ background: 'var(--bg-cream)' }}>
      <TopNav />

      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--espresso)' }}>
              Inventario
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
              {vista === 'venta'
                ? 'Solo productos que se cuentan por pieza (Vitrina y Otros)'
                : 'Materia prima para preparar — no aparece en el menú de venta'}
            </p>
          </div>
          {vista === 'venta' && (
            <button
              onClick={() => setCreando(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:brightness-105 active:scale-[0.98] flex-shrink-0"
              style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              <span className="hidden sm:inline">Agregar producto</span>
              <span className="sm:hidden">Producto</span>
            </button>
          )}
        </div>

        {/* Tabs Venta / Insumos */}
        <div className="flex gap-1.5 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {([['venta', 'Productos de venta'], ['insumos', 'Insumos']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setVista(val)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              style={vista === val ? { background: 'var(--espresso)', color: '#FEF8F0' } : { background: 'transparent', color: 'var(--text-muted)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {vista === 'venta' && (
        <>
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {tarjetas.map((t, i) => (
            <div
              key={t.label}
              className="rounded-2xl p-4 animate-in"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${t.color}1a`, color: t.color }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
                </span>
              </div>
              <p className="tabular-nums" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--espresso)', lineHeight: 1 }}>
                {t.valor}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>{t.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none transition-shadow focus:ring-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--espresso)' }}
            />
          </div>
          <div className="flex gap-2">
            {([['todos', 'Todos'], ['bajo', 'Stock bajo'], ['agotado', 'Agotados']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFiltro(val)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
                style={filtro === val
                  ? { background: 'var(--espresso)', color: '#FEF8F0' }
                  : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#E8D5BB' }} />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p>No hay productos que coincidan</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visibles.map((p, i) => (
              <ProductoRow
                key={p.id}
                producto={p}
                index={i}
                onAjustar={ajustarStock}
                onEditar={setEditando}
                onToggleDisponible={toggleDisponible}
              />
            ))}
          </div>
        )}
        </>
        )}

        {vista === 'insumos' && <InsumosPanel />}
      </main>

      {editando && (
        <EditarProductoModal
          producto={editando}
          onGuardar={guardarEdicion}
          onCerrar={() => setEditando(null)}
        />
      )}

      {creando && (
        <NuevoProductoModal
          categorias={categorias}
          onGuardar={() => { setCreando(false); fetchProductos() }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </div>
  )
}
