'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SectionSelector from '@/components/mesa/SectionSelector'
import CategoryFilter from '@/components/mesa/CategoryFilter'
import MenuGrid from '@/components/mesa/MenuGrid'
import OrderSummary from '@/components/mesa/OrderSummary'
import ActiveOrdersBanner from '@/components/mesa/ActiveOrdersBanner'
import type { Categoria, Producto, Mesa, ItemCarrito, TipoDestino, Orden, Variante } from '@/types'

export default function MesaPage() {
  const params = useParams()
  const router = useRouter()
  const mesaId = params.id as string

  const [mesa, setMesa] = useState<Mesa | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [seccion, setSeccion] = useState<TipoDestino>('cafeteria')
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)

  // Auto-seleccionar primera categoría cuando cambian las categorías o la sección
  useEffect(() => {
    const primera = categorias.find(c => c.tipo === seccion)
    if (primera && !categoriaActiva) setCategoriaActiva(primera.id)
  }, [categorias, seccion]) // eslint-disable-line react-hooks/exhaustive-deps
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [ordenesActivas, setOrdenesActivas] = useState<Orden[]>([])
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    async function cargarDatos() {
      const [{ data: mesaData }, { data: catData }, { data: prodData }, { data: ordenesData }, opcRes, varRes] = await Promise.all([
        supabase.from('mesas').select('*').eq('id', mesaId).single(),
        supabase.from('categorias').select('*').order('orden'),
        supabase.from('productos').select('*, categorias(*)').eq('disponible', true).order('nombre'),
        supabase.from('ordenes').select('*, orden_items(*, productos(nombre))').eq('mesa_id', mesaId).in('estado', ['pendiente', 'en_preparacion', 'listo']).order('created_at'),
        supabase.from('producto_opciones').select('*'),
        supabase.from('variantes').select('*').order('orden'),
      ])
      if (mesaData) setMesa(mesaData)
      if (catData) setCategorias(catData)
      if (prodData) {
        const opciones = opcRes.data ?? []
        const variantes = varRes.data ?? []
        setProductos(prodData.map((p) => ({
          ...p,
          producto_opciones: opciones.filter((o) => o.producto_id === p.id),
          variantes: variantes.filter((v) => v.producto_id === p.id),
        })))
      }
      if (ordenesData) setOrdenesActivas(ordenesData)
      setLoading(false)
    }
    cargarDatos()

    const channel = supabase
      .channel(`mesa-ordenes-${mesaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes', filter: `mesa_id=eq.${mesaId}` }, cargarDatos)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [mesaId])

  function cambiarSeccion(s: TipoDestino) {
    setSeccion(s)
    const primera = categorias.find(c => c.tipo === s)
    setCategoriaActiva(primera?.id ?? null)
  }

  const categoriasFiltradas = categorias.filter(c => c.tipo === seccion)

  const productosFiltrados = productos.filter(p => {
    const esDeLaSeccion = p.categorias?.tipo === seccion
    const esDeLaCategoria = categoriaActiva ? p.categoria_id === categoriaActiva : p.categorias?.tipo === seccion
    return esDeLaSeccion && esDeLaCategoria
  })

  const itemsCafeteria = carrito.filter(i => i.producto.categorias?.tipo === 'cafeteria')
  const itemsCocina = carrito.filter(i => i.producto.categorias?.tipo === 'cocina')

  function mostrarToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  function getItemId(item: ItemCarrito) {
    return item.variante?.id ?? item.producto.id
  }

  const agregarAlCarrito = useCallback((producto: Producto, variante?: Variante) => {
    setCarrito(prev => {
      const id = variante?.id ?? producto.id
      const existe = prev.find(i => getItemId(i) === id)
      if (existe) return prev.map(i => getItemId(i) === id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto, variante, cantidad: 1, notas: '' }]
    })
  }, [])

  const actualizarCantidad = useCallback((itemId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito(prev => prev.filter(i => getItemId(i) !== itemId))
    } else {
      setCarrito(prev => prev.map(i => getItemId(i) === itemId ? { ...i, cantidad } : i))
    }
  }, [])

  const actualizarNota = useCallback((itemId: string, nota: string) => {
    setCarrito(prev => prev.map(i => getItemId(i) === itemId ? { ...i, notas: nota } : i))
  }, [])

  async function enviarOrden() {
    if (carrito.length === 0 || !mesa) return
    setEnviando(true)

    try {
      const grupos: { destino: TipoDestino; items: ItemCarrito[] }[] = []
      if (itemsCafeteria.length > 0) grupos.push({ destino: 'cafeteria', items: itemsCafeteria })
      if (itemsCocina.length > 0)    grupos.push({ destino: 'cocina',    items: itemsCocina })

      for (const grupo of grupos) {
        const precioItem = (i: ItemCarrito) => i.variante?.precio ?? i.producto.precio
        const total = grupo.items.reduce((s, i) => s + precioItem(i) * i.cantidad, 0)

        const { data: orden, error } = await supabase
          .from('ordenes')
          .insert({ mesa_id: mesaId, estado: 'pendiente', destino: grupo.destino, total })
          .select()
          .single()

        if (error || !orden) throw error

        await supabase.from('orden_items').insert(
          grupo.items.map(i => {
            const partes = [i.variante?.nombre, i.notas].filter(Boolean)
            return {
              orden_id: orden.id,
              producto_id: i.producto.id,
              cantidad: i.cantidad,
              precio_unitario: precioItem(i),
              notas: partes.length > 0 ? partes.join(', ') : null,
            }
          })
        )
      }

      await supabase.from('mesas').update({ estado: 'ocupada' }).eq('id', mesaId)
      setMesa(m => m ? { ...m, estado: 'ocupada' } : m)
      setCarrito([])

      // Refrescar órdenes activas
      const { data } = await supabase.from('ordenes').select('*, orden_items(*, productos(nombre))').eq('mesa_id', mesaId).in('estado', ['pendiente', 'en_preparacion', 'listo']).order('created_at')
      if (data) setOrdenesActivas(data)

      const destinos = grupos.map(g => g.destino === 'cafeteria' ? 'Cafetería' : 'Cocina').join(' y ')
      mostrarToast(`Orden enviada a ${destinos}`)
    } catch {
      mostrarToast('Error al enviar la orden', false)
    } finally {
      setEnviando(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#1C0A00' }}>
        <div className="text-center">
          <svg className="animate-spin mx-auto mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
          </svg>
          <p style={{ color: '#C9A96E' }}>Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (!mesa) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#1C0A00' }}>
        <button onClick={() => router.push('/')} style={{ color: '#C9A96E' }}>Volver al inicio</button>
      </div>
    )
  }

  const estadoBadge =
    mesa.estado === 'libre'    ? { bg: '#DCFCE7', color: '#15803D', label: 'Libre' } :
    mesa.estado === 'ocupada'  ? { bg: '#FEF3E2', color: '#92400E', label: 'Ocupada' } :
                                 { bg: '#FEE2E2', color: '#B91C1C', label: 'Por pagar' }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-cream)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex-shrink-0" style={{ background: '#1C0A00', borderBottom: '2px solid #C9A96E' }}>
        {/* Top bar */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full cursor-pointer"
              style={{ color: '#C9A96E' }}
              aria-label="Volver"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#FEF8F0', lineHeight: 1.1 }}>
                Mesa {mesa.numero}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: estadoBadge.bg, color: estadoBadge.color }}>
              {estadoBadge.label}
            </span>
          </div>
        </div>

        {/* Banner órdenes activas */}
        <ActiveOrdersBanner ordenes={ordenesActivas} />

        {/* Section selector */}
        <SectionSelector
          seccion={seccion}
          onCambiar={cambiarSeccion}
          countCafeteria={itemsCafeteria.reduce((s, i) => s + i.cantidad, 0)}
          countCocina={itemsCocina.reduce((s, i) => s + i.cantidad, 0)}
        />
      </header>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Menu */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex-shrink-0" style={{ background: 'var(--bg-cream)' }}>
            <CategoryFilter
              categorias={categoriasFiltradas}
              categoriaActiva={categoriaActiva}
              onChange={setCategoriaActiva}
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4 pt-2">
            <MenuGrid
              productos={productosFiltrados}
              carrito={carrito}
              onAgregar={agregarAlCarrito}
            />
          </div>
        </div>

        {/* Order panel */}
        <div className="w-72 flex flex-col flex-shrink-0" style={{ background: '#FFFFFF', borderLeft: '1px solid #E8D5BB' }}>
          <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid #E8D5BB' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1C0A00', fontSize: '1rem' }}>
              Orden actual
            </h2>
            {carrito.length > 0 && (
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#C9A96E', color: '#1C0A00' }}>
                {carrito.reduce((s, i) => s + i.cantidad, 0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <OrderSummary
              carrito={carrito}
              mesaNumero={mesa.numero}
              enviando={enviando}
              onActualizar={actualizarCantidad}
              onActualizarNota={actualizarNota}
              onEnviar={enviarOrden}
              onLimpiar={() => setCarrito([])}
            />
          </div>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-semibold shadow-xl z-50 flex items-center gap-2"
          style={{
            background: toast.ok ? '#1C0A00' : '#7F1D1D',
            color: '#FEF8F0',
            border: `1px solid ${toast.ok ? '#C9A96E' : '#EF4444'}`,
          }}
        >
          {toast.ok
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}
